import { Check as CheckIcon } from 'lucide-react'
import { RainbowButton } from '../magicui/rainbow-button'
import Link from 'next/link'

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    href: '/login',
    priceMonthly: '$0',
    description: "Perfect for trying out MailMind with your personal Gmail account.",
    features: ['Connect 1 Gmail account', 'Up to 50 AI summaries/month', 'Smart inbox organization', 'Basic email search'],
    featured: false,
    buttonText: 'Get Started Free',
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '/coming-soon',
    priceMonthly: '$9',
    description: 'Unlimited AI power for professionals who live in their inbox.',
    features: [
      'Unlimited AI summaries',
      'Priority email highlighting',
      'Advanced smart search',
      'AI-assisted email drafting',
      'Email analytics dashboard',
      'Priority support',
    ],
    featured: true,
    buttonText: 'Coming Soon',
  },
]
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <div className="relative z-20 isolate px-6 lg:px-8">
      <div aria-hidden="true" className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl">
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="mx-auto aspect-1155/678 w-288.75 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
        />
      </div>
      <div className="mx-auto max-w-4xl text-center">
        <RainbowButton className="text-base/7 rounded-full">Pricing</RainbowButton>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-primary sm:text-6xl">
          Choose the right plan for you
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty text-gray-600 sm:text-xl/8">
        Start free and upgrade when you need more power. No credit card required.
      </p>
      <div className="mx-auto mt-10 grid max-w-lg grid-cols-1 items-center gap-y-5 sm:mt-10 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
        {tiers.map((tier, tierIdx) => (
          <div
            key={tier.id}
            className={classNames(
              tier.featured ? 'relative bg-gray-900 shadow-2xl' : 'bg-white/60 sm:mx-8 lg:mx-0',
              tier.featured
                ? ''
                : tierIdx === 0
                  ? 'rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl'
                  : 'sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none',
              'rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10',
            )}
          >
            <h3
              id={tier.id}
              className={classNames(tier.featured ? 'text-white' : 'text-primary', 'text-base/7 font-semibold')}
            >
              {tier.name}
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span
                className={classNames(
                  tier.featured ? 'text-white' : 'text-gray-900',
                  'text-5xl font-semibold tracking-tight',
                )}
              >
                {tier.priceMonthly}
              </span>
              <span className={classNames(tier.featured ? 'text-gray-400' : 'text-gray-500', 'text-base')}>/month</span>
            </p>
            <p className={classNames(tier.featured ? 'text-gray-300' : 'text-gray-600', 'mt-6 text-base/7')}>
              {tier.description}
            </p>
            <ul
              role="list"
              className={classNames(
                tier.featured ? 'text-gray-300' : 'text-gray-600',
                'mt-8 space-y-3 text-sm/6 sm:mt-10',
              )}
            >
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon
                    aria-hidden="true"
                    className={classNames('text-emerald-500 h-6 w-5 flex-none')}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={tier.href}
              aria-describedby={tier.id}
              className={classNames(
                tier.featured
                  ? 'bg-violet-500 text-white shadow-xs hover:bg-violet-400 focus-visible:outline-violet-500'
                  : 'text-primary inset-ring inset-ring-primary hover:inset-ring-violet-500 focus-visible:outline-violet-600',
                'mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10',
              )}
            >
              {tier.buttonText}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

