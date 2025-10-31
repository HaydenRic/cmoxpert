import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

const defaultMeta = {
  title: 'cmoxpert - Marketing Intelligence for FinTech Companies | Cut CAC by $127',
  description: 'Stop wasting marketing budget on fraud and verification drop-off. cmoxpert helps FinTech CMOs cut CAC by $127 in 90 days with AI-powered fraud detection, activation funnel optimization, and FCA/SEC compliance monitoring.',
  keywords: 'fintech marketing analytics, reduce CAC fintech, marketing fraud detection, customer acquisition cost reduction, fintech compliance marketing, verification drop-off optimization, FCA SEC FINRA compliance, fintech cmo tools',
  ogTitle: 'cmoxpert - Cut FinTech CAC by $127 in 90 Days',
  ogDescription: '34% of your marketing budget goes to fraud. 22% lost at verification. cmoxpert shows FinTech CMOs exactly where money is wasted and how to fix it. Real revenue attribution, not vanity metrics.',
  ogImage: 'https://cmoxpert.com/og-image.jpg',
};

export function SEOHead({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  canonical
}: SEOHeadProps) {
  const location = useLocation();

  useEffect(() => {
    const finalTitle = title || defaultMeta.title;
    const finalDescription = description || defaultMeta.description;
    const finalKeywords = keywords || defaultMeta.keywords;
    const finalOgTitle = ogTitle || title || defaultMeta.ogTitle;
    const finalOgDescription = ogDescription || description || defaultMeta.ogDescription;
    const finalOgImage = ogImage || defaultMeta.ogImage;
    const finalCanonical = canonical || `https://cmoxpert.com${location.pathname}`;

    document.title = finalTitle;

    updateMetaTag('name', 'description', finalDescription);
    updateMetaTag('name', 'keywords', finalKeywords);
    updateMetaTag('property', 'og:title', finalOgTitle);
    updateMetaTag('property', 'og:description', finalOgDescription);
    updateMetaTag('property', 'og:image', finalOgImage);
    updateMetaTag('property', 'og:url', finalCanonical);
    updateMetaTag('property', 'twitter:title', finalOgTitle);
    updateMetaTag('property', 'twitter:description', finalOgDescription);
    updateMetaTag('property', 'twitter:image', finalOgImage);
    updateMetaTag('property', 'twitter:url', finalCanonical);

    updateLink('canonical', finalCanonical);
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical, location.pathname]);

  return null;
}

function updateMetaTag(attribute: string, attributeValue: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attributeValue);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function updateLink(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.href = href;
}

export const pageMeta = {
  home: {
    title: 'cmoxpert - Marketing Intelligence for FinTech Companies | Cut CAC by $127',
    description: 'Stop wasting marketing budget on fraud and verification drop-off. cmoxpert helps FinTech CMOs cut CAC by $127 in 90 days with AI-powered fraud detection, activation funnel optimization, and FCA/SEC compliance monitoring.',
    keywords: 'fintech marketing analytics, reduce CAC fintech, marketing fraud detection, customer acquisition cost reduction, fintech compliance marketing'
  },
  pricing: {
    title: 'Pricing - cmoxpert Marketing Intelligence for FinTech | From $2,500/mo',
    description: 'Transparent pricing for FinTech marketing intelligence. Growth Stage ($2,500/mo), Scale Stage ($5,000/mo), Enterprise (custom). ROI-focused pricing based on marketing spend. No setup fees.',
    keywords: 'fintech marketing software pricing, cac reduction cost, marketing analytics pricing, fintech saas pricing'
  },
  fraudAnalysis: {
    title: 'Fraud Impact Analysis - Identify Marketing Fraud in FinTech | cmoxpert',
    description: 'See which marketing channels drive fraudulent accounts. Average 34% of FinTech marketing budgets are wasted on fraud. Identify dirty sources and reallocate budget to clean channels.',
    keywords: 'marketing fraud detection, fintech fraud analysis, fraudulent account tracking, marketing fraud tax'
  },
  activationFunnel: {
    title: 'Activation Funnel Optimization - Fix Verification Drop-Off | cmoxpert',
    description: 'Map your entire funnel from sign-up to first transaction. Identify exact drop-off points at KYC, bank linking, and verification. Average 22% of users lost at verification.',
    keywords: 'activation funnel fintech, verification drop-off, kyc optimization, bank linking conversion'
  },
  compliance: {
    title: 'Marketing Compliance Checker - FCA, SEC, FINRA Monitoring | cmoxpert',
    description: 'Automated compliance checks for financial services marketing. Flag risky campaigns before launch. Zero violations. Built for FCA, SEC, and FINRA regulations.',
    keywords: 'fintech marketing compliance, fca compliance marketing, sec finra marketing, financial services advertising compliance'
  },
  revenueAttribution: {
    title: 'Revenue Attribution - True Marketing ROI for FinTech | cmoxpert',
    description: 'Track LTV:CAC ratio by channel. See which marketing sources drive profitable customers, not just registrations. 6 attribution models: First Touch, Last Touch, Linear, Time Decay, U-Shaped, W-Shaped.',
    keywords: 'marketing attribution fintech, ltv cac ratio, revenue attribution, multi-touch attribution'
  },
  competitiveIntelligence: {
    title: 'Competitive Intelligence - Track FinTech Competitor Marketing | cmoxpert',
    description: 'Monitor when competitors raise funding, launch products, change pricing. Your CAC reacts immediately to market changes. Stay ahead of competitive pressure.',
    keywords: 'fintech competitive intelligence, competitor tracking, market intelligence fintech'
  },
  dashboard: {
    title: 'Dashboard - FinTech Marketing Intelligence | cmoxpert',
    description: 'Real-time visibility into CAC, fraud impact, activation rates, and channel performance. Track all your FinTech marketing metrics in one place.',
    keywords: 'fintech marketing dashboard, cac tracking, marketing analytics dashboard'
  }
};
