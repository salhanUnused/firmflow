import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroActions } from "@/components/HeroActions";
import { LogoMark } from "@/components/Logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white">
      <SiteHeader />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:pb-28">
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <div className="max-w-xl">
          <h1 className="text-[2.15rem] font-medium leading-[1.12] tracking-tight sm:text-5xl">
            Ship the board. Keep the firmware honest after it leaves the bench.
          </h1>
          <p className="mt-5 text-[15px] leading-7 text-zinc-400 sm:text-base">
            FirmFlow is for electronics teams who still know every SKU by name.
            Register devices, cut a release, push an OTA, watch it land, and
            roll it back if the field build misbehaves.
          </p>
          <HeroActions />
          <p className="mt-4 text-xs text-zinc-500">
            Demo tenant: Helio Labs · 128 devices on ESP32, STM32, and nRF52.
          </p>
        </div>
        <DashboardPreview />
      </div>
    </section>
  );
}

function DashboardPreview() {
  const rows = [
    ["Sensor Hub A1", "ESP32", "v1.3.0", "Online"],
    ["Gateway B7", "STM32", "v1.2.1", "Online"],
    ["Tracker C4", "nRF52", "v1.1.8", "Offline"],
    ["Controller D2", "ESP32", "v1.3.0", "Updating"],
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#12151c]">
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
        <LogoMark size={22} />
        <span className="text-xs text-zinc-300">Helio Labs · Fleet</span>
        <span className="ml-auto font-mono text-[10px] text-zinc-500">
          v1.3.0 on 84 devices
        </span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-white/8 sm:grid-cols-4">
        {[
          ["128", "Devices"],
          ["114", "Online"],
          ["8", "Updating"],
          ["6", "Offline"],
        ].map(([value, label]) => (
          <div key={label} className="bg-[#12151c] px-3 py-3">
            <p className="font-mono text-xl text-white">{value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
              {label}
            </p>
          </div>
        ))}
      </div>
      <div className="hidden sm:block">
        {rows.map(([name, platform, version, status]) => (
          <div
            key={name}
            className="grid grid-cols-[1.2fr_0.7fr_0.6fr_0.7fr] gap-2 border-t border-white/8 px-4 py-2.5 text-xs"
          >
            <span>{name}</span>
            <span className="text-zinc-500">{platform}</span>
            <span className="font-mono text-zinc-300">{version}</span>
            <span className="text-zinc-400">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Problem() {
  const items = [
    {
      n: "01",
      title: "Versions scatter after the first 30 units",
      body: "A1 is on v1.3.0, the gateway is a revision behind, and the yard tracker is still on the field-trial build.",
    },
    {
      n: "02",
      title: "USB updates do not survive a second city",
      body: "Once devices leave the lab, walking a laptop to each cabinet is how weekends disappear.",
    },
    {
      n: "03",
      title: "A silent device is an expensive guess",
      body: "Without last-seen and a release history you book a site visit before you know if it is firmware.",
    },
    {
      n: "04",
      title: "Old builds stay in the wild",
      body: "Deprecated channels linger on nRF52 trackers until someone remembers to retire them.",
    },
  ];

  return (
    <section id="product" className="border-t border-white/10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 className="max-w-sm text-2xl font-medium tracking-tight sm:text-3xl">
          The firmware problem shows up after the product ships.
        </h2>
        <ol className="divide-y divide-white/8 border-y border-white/8">
          {items.map((item) => (
            <li key={item.n} className="grid grid-cols-[3rem_1fr] gap-4 py-5">
              <span className="font-mono text-xs text-zinc-500">{item.n}</span>
              <div>
                <h3 className="text-[15px] font-medium">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-400">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Solution() {
  const steps = ["Build", "Release", "Deploy", "Monitor", "Update", "Rollback"];
  return (
    <section id="how-it-works" className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
          One workspace for the firmware lifecycle.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
          Releases stay attached to the boards running them. Helio Labs uses
          this exact path: cut v1.4.0 beta, pick four units, watch the bars,
          roll back to v1.3.0 if the canary complains.
        </p>
        <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-[0.14em] text-zinc-300">
          {steps.map((step, index) => (
            <span key={step} className="flex items-center gap-4">
              {step}
              {index < steps.length - 1 ? (
                <span className="text-zinc-600">/</span>
              ) : null}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    ["Device inventory", "Named boards, IDs like FF-A1-8C2E, platform, last seen."],
    ["Release channels", "Beta, production, deprecated — v1.4.0 through v1.1.8."],
    ["OTA rollout", "Select firmware, tick devices, watch each unit climb to 100%."],
    ["Fleet health", "Online, updating, offline, error. Relay H9 is the error case."],
    ["Deployment log", "v1.3.0 on 84 units, v1.4.0 canary on 12, older v1.2.2 closed."],
    ["Rollback", "Put selected boards back on the previous version without a truck."],
  ];

  return (
    <section id="features" className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
          What the Helio Labs team actually uses
        </h2>
        <div className="mt-8 grid border-t border-white/8 sm:grid-cols-2">
          {items.map(([title, body]) => (
            <article
              key={title}
              className="border-b border-white/8 py-6 sm:px-6 sm:odd:border-r sm:odd:pl-0 sm:even:pr-0"
            >
              <h3 className="text-[15px] font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
