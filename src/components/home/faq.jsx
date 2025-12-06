'use client'
import React from "react";
import { RainbowButton } from "../magicui/rainbow-button";

const Faq = () => {
  const [openIndex, setOpenIndex] = React.useState(null)
  const faqsData = [
    {
      question: 'How does MailMind connect to my Gmail?',
      answer: 'MailMind uses secure OAuth authentication provided by Google. We never see or store your password — you simply authorize access through Google\'s official login flow.'
    },
    {
      question: 'Is my email data safe and private?',
      answer: 'Absolutely. Your emails are processed securely and we don\'t store email content on our servers. AI summaries are generated on-demand and not retained.'
    },
    {
      question: 'What does the AI summarization do?',
      answer: 'Our AI reads your emails and generates concise summaries highlighting key points, action items, and important details — saving you time on lengthy emails.'
    },
    {
      question: 'Can I use MailMind with multiple Gmail accounts?',
      answer: 'The Free plan supports one Gmail account. Upgrade to Pro for unlimited accounts and advanced features across all your inboxes.'
    },
    {
      question: 'Does MailMind work on mobile devices?',
      answer: 'Yes! MailMind is fully responsive and works seamlessly on desktop, tablet, and mobile browsers.'
    }
  ]
  return (
    <div className='flex flex-col items-center text-center text-primary px-3 pt-30 relative z-20'>
      <RainbowButton className="rounded-full ">FAQ</RainbowButton>
      <h1 className='text-3xl md:text-4xl lg:text-6xl font-semibold mt-2  max-w-sm md:max-w-2xl'>Answer to All Your Questions and More</h1>
      <p className='tex-sm md:text-lg text-slate-500 mt-4 max-w-lg'>
        Proactively answering FAQs boosts user confidence and cuts down on support tickets.
      </p>
      <div className='max-w-3xl w-full mt-6 flex flex-col gap-2 items-start text-left'>
        {faqsData.map((faq, index) => (
          <div key={index} className='flex flex-col items-start w-full'>
            <div className='flex items-center justify-between w-full cursor-pointer bg-gradient-to-b from-white/70 via-white/30 to-white/10 border border-white/50 rounded-2xl p-6' onClick={() => setOpenIndex(openIndex === index ? null : index)}>
              <h2 className='text-md'>{faq.question}</h2>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${openIndex === index ? "rotate-180" : ""} transition-all duration-500 ease-in-out`}>
                <path d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2" stroke="#1D293D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className={`text-sm text-slate-500 px-4 transition-all duration-500 ease-in-out ${openIndex === index ? "opacity-100 max-h-[300px] translate-y-0 pt-4" : "opacity-0 max-h-0 -translate-y-2"}`} >
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Faq;
