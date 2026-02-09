export interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

export interface BannerContent {
  text: string;
  colorClass: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  highlightText: string;
  primaryButton: {
    text: string;
    link: string;
  };
  secondaryButton: {
    text: string;
    link: string;
  };
}

export interface FooterLink {
  text: string;
  url: string;
}