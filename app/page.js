import HomeClient from "./home";

export const metadata = {
  title: "Marsos | Home",
  description: "Explore top B2B categories and products across Saudi Arabia.",
  alternates: {
    canonical: "https://marsos.sa",
    languages: {
      en: "https://marsos.sa/en",
      ar: "https://marsos.sa/ar",
    },
  },
};

export default function HomePage() {
  return <HomeClient />;
}
