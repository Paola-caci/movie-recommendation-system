// app/api/placeholder/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const width = parseInt(searchParams.get('width') || '500');
  const height = parseInt(searchParams.get('height') || '750');
  const text = searchParams.get('text') || 'MOVIE';
  const bgColor = searchParams.get('bg') || '1f2937';
  const textColor = searchParams.get('textColor') || '9ca3af';
  
  // Krijo një SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${bgColor}"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif" 
        font-size="24" 
        fill="#${textColor}" 
        text-anchor="middle" 
        dy=".3em"
      >
        ${text}
      </text>
    </svg>
  `;
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}