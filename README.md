# BrochureCraft: Instant Brochure & Website Summarizer

## Overview

BrochureCraft is an AI-powered tool designed to instantly generate professional brochures and insightful summaries from any webpage. The project combines modern web technologies with AI capabilities to provide businesses, marketers, and researchers with instant, shareable marketing materials. The system features a FastAPI backend for efficient processing and a Next.js frontend for optimal user experience.

**Backend:** [Website Summarizer API](https://website-summarizer-iorx.onrender.com/docs)  
**Frontend:** [Instant Website Insights UI](https://website-summarizer-frontend.vercel.app)

## Demo Video

https://github.com/user-attachments/assets/b2c0afad-f7ec-4f92-b6bb-253a9d911152

## Key Features

- **Brochure Generator**: Built an automated system that converts website content into well-organized, professional brochure formats using OpenAI integration.
- **Instant Summarizer**: Developed a feature that quickly extracts and summarizes key insights from any webpage.
- **Streaming Responses**: Implemented real-time feedback with typewriter animation for enhanced user experience.
- **Content Filtering**: Created intelligent filtering mechanisms to remove irrelevant content and focus on meaningful website insights.

## Technologies Used

- **Frontend**: Next.js, TailwindCSS, shadcn/ui components for a responsive and polished user interface
- **Backend**: FastAPI with async processing capabilities for efficient request handling
- **AI Integration**: OpenAI API integration for advanced content generation and summarization
- **Development Tools**: Git for version control, PDM for Python dependency management, Bun for JavaScript package management

## Challenges and Learnings

A significant challenge was implementing efficient web scraping that could handle various website structures while maintaining fast response times. The solution involved optimizing async processing and creating robust parsing algorithms using beautifulsoup4. Additionally, integrating streaming responses with OpenAI's API required careful consideration of rate limits and error handling.

## Example Use Cases

BrochureCraft is perfect for:

- **Marketing Teams**: Quickly create brochures and summaries to showcase services or company values.
- **Sales Professionals**: Equip yourself with high-quality, on-demand brochures for prospective clients.
- **Researchers**: Generate concise summaries of articles or industry news for fast information gathering.

## Getting Started

1. **Clone the Repositories**
   ```bash
   ##### for frontend
   git clone https://github.com/RutamBhagat/website_summarizer_frontend
   ##### for backend
   git clone https://github.com/RutamBhagat/website_summarizer
   ```
2. **Environment Setup**
   - Add your OpenAI API key in `.env` files in both repositories.
3. **Install Dependencies**

   ```bash
   # for frontend
   cd website_summarizer_frontend
   npm i -g bun
   bun install
   # for backend
   cd ../website_summarizer
   pipx install pdm
   pdm install
   ```

4. **Run the Application**
   ##### for frontend
   - Start the frontend: `bun run dev`
   ##### for backend
   - Start the backend: `pdm run uvicorn app.main:app --reload`

## Outcome

BrochureCraft successfully provides a streamlined solution for generating marketing materials and content summaries. The application demonstrates significant efficiency improvements in content processing and presentation, making it valuable for marketing teams, sales professionals, and researchers who need quick access to well-formatted materials.```
