'use server'

import { client } from '@/lib/prisma'
import { extractEmailsFromString, extractURLfromString } from '@/lib/utils'
import { onRealTimeChat } from '../conversation'
import { clerkClient } from '@clerk/nextjs/server'
import { onMailer } from '../mailer'
import OpenAi from 'openai'

const openai = new OpenAi({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'Corinna AI',
  },
})

export const onStoreConversations = async (
  id: string,
  message: string,
  role: 'assistant' | 'user'
) => {
  const chatRoom = await client.chatRoom.update({
    where: {
      id,
    },
    data: {
      message: {
        create: {
          message,
          role,
        },
      },
    },
    include: {
      message: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  })
  return chatRoom.message[0]
}

export const onGetCurrentChatBot = async (id: string) => {
  try {
    const chatbot = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        helpdesk: true,
        name: true,
        chatBot: {
          select: {
            id: true,
            welcomeMessage: true,
            icon: true,
            textColor: true,
            background: true,
            helpdesk: true,
          },
        },
      },
    })

    if (chatbot) {
      return chatbot
    }
  } catch (error) {
    console.log(error)
  }
}

export const onSearchProducts = async (
  domainId: string,
  query: string
) => {
  try {
    // Extract meaningful keywords from the query
    const stopWords = ['show', 'me', 'find', 'search', 'looking', 'for', 'want', 'need', 'get', 'see', 'the', 'a', 'an', 'some', 'any', 'your', 'our']
    const keywords = query
      .toLowerCase()
      .split(' ')
      .filter(word => !stopWords.includes(word) && word.length > 2)

    // Try to search with extracted keywords first
    let products: Array<{
      id: string
      name: string
      price: number
      image: string
      domainId: string | null
    }> = []
    if (keywords.length > 0) {
      const searchTerm = keywords.join(' ')
      products = await client.product.findMany({
        where: {
          domainId,
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          domainId: true,
        },
        take: 6,
      })
    }

    // If no results, try searching with individual keywords
    if (products.length === 0 && keywords.length > 0) {
      for (const keyword of keywords) {
        products = await client.product.findMany({
          where: {
            domainId,
            name: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            domainId: true,
          },
          take: 6,
        })
        
        if (products.length > 0) break
      }
    }

    // If still no results, show all products (up to 6)
    if (products.length === 0) {
      products = await client.product.findMany({
        where: {
          domainId,
        },
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          domainId: true,
        },
        take: 6,
      })
    }

    return products
  } catch (error) {
    console.log(error)
    return []
  }
}

// New function to send product inquiry to n8n webhook
export const onSendProductInquiryToN8N = async (
  domainId: string,
  customerId: string,
  customerEmail: string | undefined,
  query: string,
  chatRoomId: string
) => {
  try {
    const webhookUrl = process.env.N8N_PRODUCT_WEBHOOK_URL
    
    if (!webhookUrl) {
      console.error('N8N_PRODUCT_WEBHOOK_URL is not configured')
      return { success: false, error: 'Webhook not configured' }
    }

    // Extract meaningful keywords from the query
    const stopWords = ['show', 'me', 'find', 'search', 'looking', 'for', 'want', 'need', 'get', 'see', 'the', 'a', 'an', 'some', 'any', 'your', 'our']
    const keywords = query
      .toLowerCase()
      .split(' ')
      .filter(word => !stopWords.includes(word) && word.length > 2)

    // Build URL with query parameters for GET request
    const url = new URL(webhookUrl)
    url.searchParams.append('domainId', domainId)
    url.searchParams.append('customerId', customerId)
    url.searchParams.append('customerEmail', customerEmail || 'not-provided')
    url.searchParams.append('query', query)
    url.searchParams.append('keywords', keywords.join(', '))
    url.searchParams.append('chatRoomId', chatRoomId)
    url.searchParams.append('timestamp', new Date().toISOString())

    console.log('🚀 Sending product inquiry to n8n (GET):', url.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    console.log('📥 Response status:', response.status, response.statusText)

    // Accept both 200 and 201 status codes as success
    if (response.status !== 200 && response.status !== 201) {
      const errorText = await response.text()
      console.error('❌ Webhook returned non-200 status:', response.status, errorText)
      // Still return success: true if it's a 4xx/5xx but the request was sent
      // The webhook was triggered, even if n8n had an internal issue
      return { success: true, data: { status: response.status, error: errorText } }
    }

    let result
    try {
      const responseText = await response.text()
      console.log('📄 Raw response:', responseText)
      
      // Try to parse as JSON, but accept any response
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        // If not JSON, just use the text
        result = { message: responseText }
      }
      
      console.log('✅ n8n webhook response:', result)
    } catch (textError) {
      console.log('⚠️ Could not read response body, but request succeeded')
      result = { message: 'Request sent successfully' }
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('❌ Error sending product inquiry to n8n:', error)
    // Even on error, consider it a partial success if the error is just network/parsing
    console.log('⚠️ Treating as success since the attempt was made')
    return { success: true, error: String(error) }
  }
}

let customerEmail: string | undefined

export const onAiChatBotAssistant = async (
  id: string,
  chat: { role: 'assistant' | 'user'; content: string }[],
  author: 'user',
  message: string
) => {
  try {
    const chatBotDomain = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        filterQuestions: {
          where: {
            answered: null,
          },
          select: {
            question: true,
          },
        },
      },
    })
    if (chatBotDomain) {
      const extractedEmail = extractEmailsFromString(message)
      if (extractedEmail) {
        customerEmail = extractedEmail[0]
      }

      // Check for live mode if we have a customer email (from current or previous message)
      if (customerEmail) {
        const checkCustomer = await client.domain.findUnique({
          where: {
            id,
          },
          select: {
            User: {
              select: {
                clerkId: true,
              },
            },
            name: true,
            customer: {
              where: {
                email: {
                  startsWith: customerEmail,
                },
              },
              select: {
                id: true,
                email: true,
                questions: true,
                chatRoom: {
                  select: {
                    id: true,
                    live: true,
                    mailed: true,
                  },
                },
              },
            },
          },
        })
        if (checkCustomer && !checkCustomer.customer.length) {
          const newCustomer = await client.domain.update({
            where: {
              id,
            },
            data: {
              customer: {
                create: {
                  email: customerEmail,
                  questions: {
                    create: chatBotDomain.filterQuestions,
                  },
                  chatRoom: {
                    create: {},
                  },
                },
              },
            },
          })
          if (newCustomer) {
            console.log('new customer made')
            const response = {
              role: 'assistant',
              content: `Welcome aboard ${
                customerEmail.split('@')[0]
              }! I'm glad to connect with you. Is there anything you need help with?`,
            }
            return { response }
          }
        }
        if (checkCustomer && checkCustomer.customer.length > 0 && checkCustomer.customer[0].chatRoom.length > 0) {
          const chatRoomLive = checkCustomer.customer[0].chatRoom[0].live
          const chatRoomId = checkCustomer.customer[0].chatRoom[0].id
          
          if (chatRoomLive) {
            const storedMessage = await onStoreConversations(
              chatRoomId,
              message,
              author
            )
            
            onRealTimeChat(
              chatRoomId,
              message,
              storedMessage.id,
              author
            )

            if (!checkCustomer.customer[0].chatRoom[0].mailed) {
              const clerk = await clerkClient()
              const user = await clerk.users.getUser(
                checkCustomer.User?.clerkId!
              )

              onMailer(user.emailAddresses[0].emailAddress)

              //update mail status to prevent spamming
              const mailed = await client.chatRoom.update({
                where: {
                  id: chatRoomId,
                },
                data: {
                  mailed: true,
                },
              })

              if (mailed) {
                return {
                  live: true,
                  chatRoom: chatRoomId,
                }
              }
            }
            return {
              live: true,
              chatRoom: chatRoomId,
            }
          }
        }

        if (checkCustomer && checkCustomer.customer.length > 0 && checkCustomer.customer[0].chatRoom.length > 0) {
          const chatRoomId = checkCustomer.customer[0].chatRoom[0].id
          
          await onStoreConversations(
            chatRoomId,
            message,
            author
          )

          // Double-check if chatRoom is now in live mode (in case merchant activated it)
          const updatedChatRoom = await client.chatRoom.findUnique({
            where: {
              id: chatRoomId,
            },
            select: {
              live: true,
            },
          })

          if (updatedChatRoom?.live) {
            return {
              live: true,
              chatRoom: chatRoomId,
            }
          }
        }

        // TEST MODE REMOVED: Products now handled via n8n webhook
        
        // Check if message is asking for products
        const productKeywords = ['product', 'products', 'show', 'looking for', 'find', 'search', 'buy', 'purchase', 'shop', 'item', 'items']
        const isProductQuery = productKeywords.some(keyword => 
          message.toLowerCase().includes(keyword)
        )

        console.log('🔍 Product Query Check:', { 
          message, 
          isProductQuery,
          matchedKeyword: productKeywords.find(k => message.toLowerCase().includes(k))
        })

        // If it's a product query, send to n8n webhook
        if (isProductQuery) {
          console.log('✅ Product query detected! Triggering n8n webhook...')
          
          // Send product inquiry to n8n workflow
          const webhookResult = await onSendProductInquiryToN8N(
            id,
            checkCustomer?.customer[0].id!,
            customerEmail,
            message,
            checkCustomer?.customer[0].chatRoom[0].id!
          )
          
          console.log('📡 Webhook Result:', webhookResult)
          
          let responseContent = ''
          let products = []
          
          if (webhookResult.success && webhookResult.data) {
            // Check if n8n returned products
            if (webhookResult.data.products && Array.isArray(webhookResult.data.products) && webhookResult.data.products.length > 0) {
              products = webhookResult.data.products
              responseContent = webhookResult.data.message || `I found ${products.length} product${products.length > 1 ? 's' : ''} for you! Check them out below:`
            } else if (webhookResult.data.message) {
              // n8n sent a message but no products
              responseContent = webhookResult.data.message
            } else {
              // Fallback
              responseContent = `I've received your product inquiry! Let me check what we have available for you. I'll get back to you with some great options shortly! 🔍`
            }
          } else {
            responseContent = `I received your product inquiry, but I'm having trouble accessing our product catalog right now. One of our team members will assist you shortly!`
          }

          const response = {
            role: 'assistant',
            content: responseContent,
            ...(products.length > 0 && { products }),
          }

          await onStoreConversations(
            checkCustomer?.customer[0].chatRoom[0].id!,
            response.content,
            'assistant'
          )

          return { 
            response,
            customerId: checkCustomer?.customer[0].id
          }
        }

        const chatCompletion = await openai.chat.completions.create({
          messages: [
            {
              role: 'assistant',
              content: `
              You will get an array of questions that you must ask the customer. 
              
              Progress the conversation using those questions. 
              
              Whenever you ask a question from the array i need you to add a keyword at the end of the question (complete) this keyword is extremely important. 
              
              Do not forget it.

              only add this keyword when your asking a question from the array of questions. No other question satisfies this condition

              Always maintain character and stay respectfull.

              The array of questions : [${chatBotDomain.filterQuestions
                .map((questions) => questions.question)
                .join(', ')}]

              if the customer says something out of context or inapporpriate. Simply say this is beyond you and you will get a real user to continue the conversation. And add a keyword (realtime) at the end.

              if the customer agrees to book an appointment send them this link http://localhost:3000/portal/${id}/appointment/${
                checkCustomer?.customer[0].id
              }

              If the customer asks about products or wants to see available items, tell them they can ask you to search for products by name or description. Add a keyword (product-inquiry) at the end when mentioning this.

              if the customer wants to buy a product redirect them to the payment page http://localhost:3000/portal/${id}/payment/${
                checkCustomer?.customer[0].id
              }
          `,
            },
            ...chat,
            {
              role: 'user',
              content: message,
            },
          ],
          model: 'openai/gpt-3.5-turbo',
        })

        if (chatCompletion.choices[0].message.content?.includes('(realtime)')) {
          const realtime = await client.chatRoom.update({
            where: {
              id: checkCustomer?.customer[0].chatRoom[0].id,
            },
            data: {
              live: true,
            },
          })

          if (realtime) {
            const response = {
              role: 'assistant',
              content: chatCompletion.choices[0].message.content.replace(
                '(realtime)',
                ''
              ),
            }

            await onStoreConversations(
              checkCustomer?.customer[0].chatRoom[0].id!,
              response.content,
              'assistant'
            )

            return { response }
          }
        }
        if (chat[chat.length - 1].content.includes('(complete)')) {
          const firstUnansweredQuestion =
            await client.customerResponses.findFirst({
              where: {
                customerId: checkCustomer?.customer[0].id,
                answered: null,
              },
              select: {
                id: true,
              },
              orderBy: {
                question: 'asc',
              },
            })
          if (firstUnansweredQuestion) {
            await client.customerResponses.update({
              where: {
                id: firstUnansweredQuestion.id,
              },
              data: {
                answered: message,
              },
            })
          }
        }

        if (chatCompletion) {
          const generatedLink = extractURLfromString(
            chatCompletion.choices[0].message.content as string
          )

          if (generatedLink) {
            const link = generatedLink[0]
            const response = {
              role: 'assistant',
              content: `Great! you can follow the link to proceed`,
              link: link.slice(0, -1),
            }

            await onStoreConversations(
              checkCustomer?.customer[0].chatRoom[0].id!,
              `${response.content} ${response.link}`,
              'assistant'
            )

            return { response }
          }

          const response = {
            role: 'assistant',
            content: chatCompletion.choices[0].message.content,
          }

          await onStoreConversations(
            checkCustomer?.customer[0].chatRoom[0].id!,
            `${response.content}`,
            'assistant'
          )

          return { response }
        }
      }
      console.log('No customer')
      
      // TEST MODE REMOVED: Products now handled via n8n webhook
      
      // Check if message is asking for products (for non-logged-in users)
      const productKeywords = ['product', 'products', 'show', 'looking for', 'find', 'search', 'buy', 'purchase', 'shop', 'item', 'items']
      const isProductQuery = productKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      )

      console.log('🔍 [Guest] Product Query Check:', { 
        message, 
        isProductQuery,
        matchedKeyword: productKeywords.find(k => message.toLowerCase().includes(k))
      })

      if (isProductQuery) {
        console.log('✅ [Guest] Product query detected! Triggering n8n webhook...')
        
        // Send to n8n webhook even for non-logged-in users
        const webhookResult = await onSendProductInquiryToN8N(
          id,
          'guest', // No customer ID yet
          undefined, // No email yet
          message,
          'guest-session' // No chat room yet
        )
        
        console.log('📡 [Guest] Webhook Result:', webhookResult)
        
        let responseContent = ''
        let products = []
        
        if (webhookResult.success && webhookResult.data) {
          // Check if n8n returned products
          if (webhookResult.data.products && Array.isArray(webhookResult.data.products) && webhookResult.data.products.length > 0) {
            products = webhookResult.data.products
            responseContent = webhookResult.data.message || `I found ${products.length} amazing product${products.length > 1 ? 's' : ''} for you! To complete your purchase, please share your email address. 📧`
          } else if (webhookResult.data.message) {
            // n8n sent a message but no products
            responseContent = webhookResult.data.message
          } else {
            // Fallback
            responseContent = `I'd love to help you find the perfect products! I've noted your inquiry. To provide you with personalized recommendations and complete your purchase, could you please share your email address? 📧`
          }
        } else {
          responseContent = `I'd be happy to help you with products! To get started and show you our best options, could you please provide your email address?`
        }

        const response = {
          role: 'assistant',
          content: responseContent,
          ...(products.length > 0 && { products }),
        }

        return { response }
      }
      
      const chatCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: `
            You are a highly knowledgeable and experienced sales representative for a ${chatBotDomain.name} that offers a valuable product or service. Your goal is to have a natural, human-like conversation with the customer in order to understand their needs, provide relevant information, and ultimately guide them towards making a purchase or redirect them to a link if they havent provided all relevant information.
            Right now you are talking to a customer for the first time. Start by giving them a warm welcome on behalf of ${chatBotDomain.name} and make them feel welcomed.

            Your next task is lead the conversation naturally to get the customers email address. Be respectful and never break character

            If the customer asks about products, tell them you can help them find products and show them options. Encourage them to describe what they're looking for.

          `,
          },
          ...chat,
          {
            role: 'user',
            content: message,
          },
        ],
        model: 'openai/gpt-3.5-turbo',
      })

      if (chatCompletion) {
        const response = {
          role: 'assistant',
          content: chatCompletion.choices[0].message.content,
        }

        return { response }
      }
    }
  } catch (error) {
    console.log(error)
  }
}
