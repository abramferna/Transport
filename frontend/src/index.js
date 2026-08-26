import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "ViaNordTrans",
  description:
    "Empresa de transporte de mercancías con base en Girona. Rutas fijas entre Girona, Barcelona y La Jonquera. Flota propia, entregas urgentes en 24h o el mismo día.",
  url: "https://www.vianordtrans.es",
  logo: "https://www.vianordtrans.es/logo-vnt.jpeg",
  image: "https://www.vianordtrans.es/logo-vnt.jpeg",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Girona",
    addressRegion: "Catalunya",
    addressCountry: "ES",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "41.9794",
    longitude: "2.8214",
  },
  areaServed: [
    { "@type": "City", name: "Girona" },
    { "@type": "City", name: "Barcelona" },
    { "@type": "City", name: "La Jonquera" },
    { "@type": "State", name: "Catalunya" },
  ],
  serviceType: "Transporte de mercancías",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios de transporte",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Envío urgente mismo día" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Entrega en 24 horas" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Plan semanal Básico" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Plan semanal Estándar" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Plan semanal Premium" },
      },
    ],
  },
  priceRange: "€€",
  currenciesAccepted: "EUR",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "20:00",
    },
  ],
};

const structuredDataNode = document.createElement("script");
structuredDataNode.type = "application/ld+json";
structuredDataNode.textContent = JSON.stringify(localBusinessSchema);
document.head.appendChild(structuredDataNode);

window.addEventListener(
  "error",
  (event) => {
    if (
      event.error instanceof DOMException &&
      event.error.name === "DataCloneError" &&
      event.message?.includes("PerformanceServerTiming")
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  },
  true,
);

(() => {
  const posthog = window.posthog || [];
  if (posthog.__SV) return;

  window.posthog = posthog;
  posthog._i = [];
  posthog.init = function init(apiKey, options, name) {
    const target = name ? (posthog[name] = []) : posthog;
    target.people = target.people || [];
    target.toString = function toString(stub) {
      return `${name ? `posthog.${name}` : "posthog"}${stub ? " (stub)" : ""}`;
    };
    target.people.toString = () => `${target.toString(1)}.people (stub)`;
    const methods =
      "init capture identify register register_once unregister reset get_distinct_id get_session_id getFeatureFlag isFeatureEnabled".split(
        " ",
      );
    methods.forEach((method) => {
      target[method] = (...args) => {
        target.push([method, ...args]);
      };
    });
    posthog._i.push([apiKey, options, name]);
  };
  posthog.__SV = 1;
  posthog.init("phc_xAvL2Iq4tFmANRE7kzbKwaSqp1HJjN7x48s3vr0CMjs", {
    api_host: "https://us.i.posthog.com",
    person_profiles: "identified_only",
    session_recording: {
      recordCrossOriginIframes: true,
      capturePerformance: false,
    },
  });

  const posthogLoader = document.createElement("script");
  posthogLoader.type = "text/javascript";
  posthogLoader.crossOrigin = "anonymous";
  posthogLoader.async = true;
  posthogLoader.src =
    "https://us.i.posthog.com/static/array.js".replace(
      ".i.posthog.com",
      "-assets.i.posthog.com",
    );
  document.head.appendChild(posthogLoader);
})();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
