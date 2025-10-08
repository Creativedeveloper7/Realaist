# OpenAI GPT Integration Setup Guide

## 🚀 Quick Setup

### 1. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the key (it starts with `sk-`)

### 2. Configure Environment Variables
Create a `.env` file in your project root:

```bash
# OpenAI Configuration (Note: Vite uses VITE_ prefix, not REACT_APP_)
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Restart Development Server
```bash
npm run dev
```

## 🔧 Features

### AI-Powered Responses
- **Natural Language Understanding**: GPT understands complex queries
- **Context Awareness**: Remembers conversation history
- **Property Database Integration**: Has access to all property data
- **Intelligent Filtering**: Can combine multiple search criteria

### Fallback System
- **Automatic Fallback**: If OpenAI is unavailable, uses local intelligent responses
- **No Downtime**: Chatbot always works, even without API key
- **Seamless Switching**: Toggle between AI and local modes

### Smart Property Search
The AI can understand queries like:
- "Show me 3 bedroom apartments in Westlands under $600k"
- "I want luxury villas in Karen with a pool"
- "What properties are available in my budget of $1.2M?"
- "Compare properties in Kilimani vs Westlands"

## 💰 Cost Considerations

### OpenAI Pricing (as of 2024)
- **GPT-3.5-turbo**: $0.0015 per 1K input tokens, $0.002 per 1K output tokens
- **Typical conversation**: ~$0.01-0.05 per conversation
- **Free tier**: $5 credit for new accounts

### Optimization Tips
1. **Token Limits**: Responses limited to 500 tokens
2. **Efficient Prompts**: System prompt optimized for property queries
3. **Fallback Mode**: Local responses when API limits reached

## 🛠️ Advanced Configuration

### Custom Model
```bash
VITE_OPENAI_MODEL=gpt-4
```

### Custom Base URL (for Azure OpenAI)
```bash
VITE_OPENAI_BASE_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment
```

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for configuration
3. **Implement rate limiting** in production
4. **Monitor usage** to avoid unexpected costs
5. **Use API key restrictions** in OpenAI dashboard

## 🚨 Troubleshooting

### Common Issues

**"OpenAI API key not configured"**
- Check your `.env` file exists
- Verify the variable name is `VITE_OPENAI_API_KEY` (not REACT_APP_)
- Restart your development server

**"OpenAI API error: Invalid API key"**
- Verify your API key is correct
- Check if your OpenAI account has credits
- Ensure the key has proper permissions

**"Rate limit exceeded"**
- Wait a few minutes before trying again
- Consider upgrading your OpenAI plan
- Implement request queuing

### Debug Mode
Check browser console for detailed error messages and API responses.

## 📊 Monitoring

### Usage Tracking
- Monitor token usage in OpenAI dashboard
- Set up billing alerts
- Track conversation quality

### Performance Metrics
- Response time comparison (AI vs Local)
- User satisfaction with AI responses
- Fallback frequency

## 🔄 Migration from Local to AI

The chatbot automatically detects if OpenAI is configured and switches to AI mode. No code changes needed - just add your API key!

## 📞 Support

For issues with:
- **OpenAI API**: Check [OpenAI Documentation](https://platform.openai.com/docs)
- **Integration**: Review the `openaiService.ts` file
- **Property Data**: Check the property database in `ChatBot.tsx`
