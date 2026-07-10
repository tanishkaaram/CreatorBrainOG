import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-jakarta',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'CreatorBrainOG — AI Growth Intelligence for Instagram Creators',
    description:
        'Know exactly what to post. Before you post it. AI-powered content strategy for Instagram creators across any niche.',
    keywords: 'instagram creator, ai content strategy, creator analytics, instagram growth, content ideas',
    openGraph: {
        title: 'CreatorBrainOG',
        description: 'AI-powered growth intelligence for Instagram creators',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}
                style={{ backgroundColor: '#0A0A0F' }}
            >
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: 'rgba(10, 10, 15, 0.95)',
                            color: '#fff',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(20px)',
                            fontSize: '14px',
                        },
                        success: {
                            iconTheme: { primary: '#06B6D4', secondary: '#fff' },
                        },
                        error: {
                            iconTheme: { primary: '#EF4444', secondary: '#fff' },
                        },
                    }}
                />
            </body>
        </html>
    );
}
