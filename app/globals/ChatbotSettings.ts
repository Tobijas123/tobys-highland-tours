import type { GlobalConfig } from 'payload'

const ChatbotSettings: GlobalConfig = {
  slug: 'chatbot-settings',

  access: {
    read: () => true,
  },

  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Chatbot enabled',
      defaultValue: true,
    },
    {
      name: 'greeting',
      type: 'text',
      label: 'Greeting message',
      defaultValue: "Hi! I'm Hamish, your Highland guide — how can I help?",
    },
  ],
}

export default ChatbotSettings
