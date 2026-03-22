"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BrainCircuit,
  CheckCircle2,
  FileStack,
  FileText,
  Search,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { type AppDictionary } from "@/lib/i18n/dictionaries";
import { type Locale } from "@/lib/types";

type LandingShellProps = {
  locale: Locale;
  dictionary: AppDictionary;
};

const heroIcons = [BrainCircuit, FileStack, BookOpenText] as const;
const stepIcons = [FileText, Search, BrainCircuit] as const;
const useCaseIcons = [BookOpenText, BrainCircuit, Smartphone] as const;
const proofIcons = [CheckCircle2, FileStack, Smartphone] as const;

const primaryLinkClass =
  "inline-flex items-center justify-center rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-medium text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-accent-strong)]";

const secondaryLinkClass =
  "inline-flex items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-white/82 px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:bg-white";

export function LandingShell({ locale, dictionary }: LandingShellProps) {
  const { user } = useAuth();
  const primaryHref = user ? `/${locale}/projects` : `/${locale}/login`;
  const copy = dictionary.landing;
  const workspaceCopy = dictionary.workspace;
  const marketing =
    locale === "es"
      ? {
          liveMockup: "Mockup guiado",
          highlightsEyebrow: "Flujo principal",
          highlightsTitle: "La landing ahora enseña el producto en lugar de insinuarlo.",
          highlightsDescription:
            "Tres cards más amplias, iconos más visibles y descripciones con más aire para que el valor del producto se entienda a primer vistazo.",
          heroProjectTitle: "Termodinámica · parcial 2",
          heroDocuments: [
            "Tema 4 - Ciclos.pdf",
            "Problemas guiados.pptx",
            "Formulas examen.jpg",
          ],
          heroQuestionLabel: "Pregunta",
          heroQuestion: "Resume la diferencia entre rendimiento y eficiencia.",
          heroAnswer:
            "El rendimiento compara trabajo util frente a energia aportada; la eficiencia del ciclo mide cuanta energia se conserva en la salida.",
          heroCitationMeta: "Pagina 12 · definicion y formula general.",
          studioDocuments: [
            { name: "Resumen tema 6.pdf", status: workspaceCopy.ready },
            { name: "Diapositivas clase.pptx", status: workspaceCopy.ready },
            { name: "Ejercicios resueltos.docx", status: workspaceCopy.processing },
          ],
          studioPreviewFile: "Resumen tema 6.pdf",
          studioFormulaLabel: "Formula destacada",
          studioFormula: "eta = 1 - T fria / T caliente",
          studioQuestion: "Que diferencias suelen caer en el examen?",
          studioAnswer:
            "Normalmente confunden trabajo neto, rendimiento termico y condiciones de reversibilidad.",
          studioCitationLabel: "Cita vinculada",
          studioCitationMeta: "Resumen tema 6.pdf · pagina 14",
          mobilePreviewMeta: "Diapositiva 12 · electrostática",
          mobileFocus: "Focus",
          mobileNote:
            "Docs, Preview y Chat se entienden tambien en pantalla pequena.",
        }
      : {
          liveMockup: "Guided mockup",
          highlightsEyebrow: "Core flow",
          highlightsTitle: "The landing now shows the product instead of hinting at it.",
          highlightsDescription:
            "Three wider cards, clearer icons, and more breathing room so the product value reads on the first pass.",
          heroProjectTitle: "Thermodynamics · midterm 2",
          heroDocuments: [
            "Topic 4 - Cycles.pdf",
            "Guided problems.pptx",
            "Exam formulas.jpg",
          ],
          heroQuestionLabel: "Question",
          heroQuestion: "Summarize the difference between output and efficiency.",
          heroAnswer:
            "Output compares useful work against input energy, while cycle efficiency measures how much energy remains usable at the end.",
          heroCitationMeta: "Page 12 · definition and general formula.",
          studioDocuments: [
            { name: "Topic 6 summary.pdf", status: workspaceCopy.ready },
            { name: "Lecture slides.pptx", status: workspaceCopy.ready },
            { name: "Solved exercises.docx", status: workspaceCopy.processing },
          ],
          studioPreviewFile: "Topic 6 summary.pdf",
          studioFormulaLabel: "Key formula",
          studioFormula: "eta = 1 - T cold / T hot",
          studioQuestion: "Which differences usually show up on the exam?",
          studioAnswer:
            "Students usually mix up net work, thermal efficiency, and reversibility conditions.",
          studioCitationLabel: "Linked citation",
          studioCitationMeta: "Topic 6 summary.pdf · page 14",
          mobilePreviewMeta: "Slide 12 · electrostatics",
          mobileFocus: "Focus",
          mobileNote:
            "Docs, Preview, and Chat still make sense on a smaller screen.",
        };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 pb-16 pt-4 sm:px-6 sm:pb-20">
      <div className="flex w-full flex-col gap-8 lg:gap-10">
        <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 sm:p-10">
            <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-r from-teal-200/50 via-white/0 to-orange-200/40" />
            <div className="relative">
              <p className="caps-label text-xs text-[var(--color-ink-soft)]">{copy.eyebrow}</p>
              <h1 className="mt-6 max-w-3xl text-5xl leading-[0.95] sm:text-7xl">
                {copy.title}
              </h1>
              <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[var(--color-ink-soft)] sm:text-lg">
                {copy.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link className={primaryLinkClass} href={primaryHref}>
                  {copy.primaryCta}
                  <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" focusable="false" />
                </Link>
                <Link className={secondaryLinkClass} href={`/${locale}#how-it-works`}>
                  {copy.secondaryCta}
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {copy.trustLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-[var(--color-line)] bg-white/74 px-3 py-1.5 text-xs font-semibold text-[var(--color-ink-soft)]"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-10 rounded-[2rem] border border-[var(--color-line)] bg-white/72 p-3 shadow-[var(--shadow-soft)] sm:p-4">
                <div className="rounded-[1.65rem] border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="caps-label text-[11px] text-[var(--color-ink-soft)]">
                        {copy.workspaceTitle}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                        {marketing.heroProjectTitle}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent-strong)]">
                      {workspaceCopy.filterAll}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[0.95fr_1.15fr]">
                    <div className="rounded-[1.4rem] border border-[var(--color-line)] bg-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{workspaceCopy.documents}</p>
                        <span className="text-xs text-[var(--color-ink-soft)]">{marketing.heroDocuments.length}</span>
                      </div>
                      <div className="mt-3 space-y-2.5">
                        {marketing.heroDocuments.map((document) => (
                          <div
                            key={document}
                            className="rounded-[1.1rem] border border-[var(--color-line)] px-3 py-2.5"
                          >
                            <p className="text-sm font-semibold text-[var(--color-ink)]">
                              {document}
                            </p>
                            <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">
                              {workspaceCopy.ready}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] bg-[var(--color-surface-dark)] p-4 text-white">
                      <p className="caps-label text-[11px] text-white/60">{workspaceCopy.chat}</p>
                      <div className="mt-3 space-y-3">
                        <div className="rounded-[1.15rem] bg-white/10 px-3 py-2.5">
                          <p className="text-[13px] text-white/70">{marketing.heroQuestionLabel}</p>
                          <p className="mt-1 text-sm leading-6">{marketing.heroQuestion}</p>
                        </div>
                        <div className="rounded-[1.15rem] bg-white px-3 py-3 text-[var(--color-ink)]">
                          <p className="text-sm leading-6">{marketing.heroAnswer}</p>
                          <div className="mt-3 rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-accent-soft)] px-3 py-2">
                            <p className="text-[13px] font-semibold">{marketing.heroDocuments[0]}</p>
                            <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">
                              {marketing.heroCitationMeta}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="grid gap-6">
            <div className="glass-panel rounded-[2.35rem] p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="caps-label text-sm text-[var(--color-ink-soft)]">
                    {copy.studioTitle}
                  </p>
                  <h2 className="mt-3 text-3xl sm:text-[2rem]">{copy.workspaceTitle}</h2>
                </div>
                <span className="rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-xs font-semibold text-white">
                  {marketing.liveMockup}
                </span>
              </div>

              <div className="mt-6 rounded-[2rem] bg-[#0d1b23] p-4 text-white shadow-[0_18px_40px_rgba(16,33,43,0.22)] sm:p-5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/35" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-[0.74fr_1.02fr_0.9fr]">
                  <div className="rounded-[1.45rem] bg-white/6 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                      {workspaceCopy.documents}
                    </p>
                    <div className="mt-3 space-y-2">
                      {marketing.studioDocuments.map((item, index) => (
                        <div
                          key={item.name}
                          className={`rounded-[1.1rem] border px-3 py-2.5 ${
                            index === 0
                              ? "border-teal-300/40 bg-white/12"
                              : "border-white/8 bg-black/10"
                          }`}
                        >
                          <p className="text-sm font-semibold text-white">{item.name}</p>
                          <p className="mt-1 text-[13px] text-white/62">{item.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.45rem] bg-white p-3 text-[var(--color-ink)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{workspaceCopy.preview}</p>
                        <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">
                          {marketing.studioPreviewFile}
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--color-accent-strong)]">
                        14 / 42
                      </span>
                    </div>

                    <div className="mt-4 rounded-[1.25rem] border border-[var(--color-line)] bg-[#f8f6f1] p-4">
                      <div className="h-3.5 w-32 rounded-full bg-[rgba(16,33,43,0.12)]" />
                      <div className="mt-3 space-y-2">
                        <div className="h-2.5 rounded-full bg-[rgba(16,33,43,0.08)]" />
                        <div className="h-2.5 w-[88%] rounded-full bg-[rgba(16,33,43,0.08)]" />
                        <div className="h-2.5 w-[77%] rounded-full bg-[rgba(16,33,43,0.08)]" />
                      </div>
                      <div className="mt-5 rounded-[1rem] border border-teal-200 bg-teal-50 px-3 py-2.5">
                        <p className="text-[13px] font-semibold text-[var(--color-accent-strong)]">
                          {marketing.studioFormulaLabel}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[var(--color-ink)]">{marketing.studioFormula}</p>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="h-2.5 rounded-full bg-[rgba(16,33,43,0.08)]" />
                        <div className="h-2.5 w-[70%] rounded-full bg-[rgba(16,33,43,0.08)]" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.45rem] bg-white/8 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                      {copy.studioChatTitle}
                    </p>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-[1.1rem] bg-white/10 px-3 py-2.5">
                        <p className="text-[13px] text-white/68">{marketing.heroQuestionLabel}</p>
                        <p className="mt-1 text-sm leading-6">{marketing.studioQuestion}</p>
                      </div>
                      <div className="rounded-[1.1rem] bg-white px-3 py-3 text-[var(--color-ink)]">
                        <p className="text-sm leading-6">{marketing.studioAnswer}</p>
                        <div className="mt-3 rounded-[1rem] border border-[var(--color-line)] bg-[#f7f4ed] px-3 py-2.5">
                          <p className="text-[13px] font-semibold">{marketing.studioCitationLabel}</p>
                          <p className="mt-1 text-[13px] leading-5 text-[var(--color-ink-soft)]">
                            {marketing.studioCitationMeta}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-4">
                    <p className="caps-label text-[11px] text-white/55">{copy.studioChatTitle}</p>
                    <p className="mt-3 text-[15px] leading-6 text-white/82">
                      {copy.studioChatDescription}
                    </p>
                  </div>
                  <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-4">
                    <p className="caps-label text-[11px] text-white/55">
                      {copy.studioProcessingTitle}
                    </p>
                    <p className="mt-3 text-[15px] leading-6 text-white/82">
                      {copy.studioProcessingDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="glass-panel rounded-[2.2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="caps-label text-xs text-[var(--color-ink-soft)]">{marketing.highlightsEyebrow}</p>
              <h2 className="mt-4 text-3xl sm:text-4xl">{marketing.highlightsTitle}</h2>
            </div>
            <p className="max-w-2xl text-[15px] leading-7 text-[var(--color-ink-soft)]">
              {marketing.highlightsDescription}
            </p>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-3">
            {copy.heroHighlights.map((item, index) => {
              const Icon = heroIcons[index] ?? BrainCircuit;

              return (
                <article
                  key={item.title}
                  className="rounded-[1.8rem] border border-[var(--color-line)] bg-white/78 p-6 shadow-[var(--shadow-soft)]"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]">
                    <Icon aria-hidden="true" className="h-6 w-6" focusable="false" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-[var(--color-ink-soft)]">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="how-it-works" className="glass-panel rounded-[2.2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="caps-label text-xs text-[var(--color-ink-soft)]">
                {copy.howItWorksTitle}
              </p>
              <h2 className="mt-4 text-3xl sm:text-4xl">{copy.howItWorksTitle}</h2>
            </div>
            <p className="max-w-2xl text-[15px] leading-7 text-[var(--color-ink-soft)]">
              {copy.howItWorksDescription}
            </p>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-3">
            {copy.howItWorksSteps.map((step, index) => {
              const Icon = stepIcons[index] ?? FileText;

              return (
                <article
                  key={step.title}
                  className="rounded-[1.8rem] border border-[var(--color-line)] bg-white/78 p-6"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-ink)] text-white">
                    <Icon aria-hidden="true" className="h-5 w-5" focusable="false" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-[var(--color-ink-soft)]">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <div id="use-cases" className="glass-panel rounded-[2.2rem] p-6 sm:p-8">
            <p className="caps-label text-xs text-[var(--color-ink-soft)]">{copy.useCasesTitle}</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">{copy.useCasesTitle}</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--color-ink-soft)]">
              {copy.useCasesDescription}
            </p>

            <div className="mt-8 space-y-4">
              {copy.useCases.map((useCase, index) => {
                const Icon = useCaseIcons[index] ?? BookOpenText;

                return (
                  <article
                    key={useCase.title}
                    className="rounded-[1.75rem] border border-[var(--color-line)] bg-white/78 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(239,131,84,0.16)] text-[var(--color-warning)]">
                        <Icon aria-hidden="true" className="h-5 w-5" focusable="false" />
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold">{useCase.title}</h3>
                        <p className="mt-2 text-[15px] leading-7 text-[var(--color-ink-soft)]">
                          {useCase.description}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="glass-panel rounded-[2.2rem] p-6 sm:p-8">
            <p className="caps-label text-xs text-[var(--color-ink-soft)]">
              {copy.workspaceTitle}
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl">{copy.workspaceTitle}</h2>
            <p className="mt-4 text-[15px] leading-7 text-[var(--color-ink-soft)]">
              {copy.workspaceDescription}
            </p>

            <div className="mt-8 flex justify-center">
              <div className="w-full max-w-[21rem] rounded-[2.4rem] border border-[var(--color-line)] bg-[#101f28] p-3 text-white shadow-[0_18px_40px_rgba(16,33,43,0.18)]">
                <div className="rounded-[2rem] bg-[#162833] p-4">
                  <div className="mx-auto h-1.5 w-14 rounded-full bg-white/18" />
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[workspaceCopy.mobileDocs, workspaceCopy.mobilePreview, workspaceCopy.mobileChat].map(
                      (label, index) => (
                        <div
                          key={label}
                          className={`rounded-full px-3 py-2 text-center text-xs font-semibold ${
                            index === 1 ? "bg-white text-[var(--color-ink)]" : "bg-white/10 text-white/68"
                          }`}
                        >
                          {label}
                        </div>
                      ),
                    )}
                  </div>

                  <div className="mt-4 rounded-[1.5rem] bg-white p-4 text-[var(--color-ink)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{workspaceCopy.preview}</p>
                        <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">
                          {marketing.mobilePreviewMeta}
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-accent-strong)]">
                        {marketing.mobileFocus}
                      </span>
                    </div>

                    <div className="mt-4 rounded-[1.2rem] border border-[var(--color-line)] bg-[#faf7f1] p-4">
                      <div className="h-20 rounded-[1rem] bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(239,131,84,0.12))]" />
                      <div className="mt-4 space-y-2">
                        <div className="h-2.5 rounded-full bg-[rgba(16,33,43,0.08)]" />
                        <div className="h-2.5 w-[78%] rounded-full bg-[rgba(16,33,43,0.08)]" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[1.35rem] bg-white/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/58">
                      {workspaceCopy.chat}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/82">{marketing.mobileNote}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[2.2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="caps-label text-xs text-[var(--color-ink-soft)]">{copy.proofTitle}</p>
              <h2 className="mt-4 text-3xl sm:text-4xl">{copy.proofTitle}</h2>
            </div>
            <p className="max-w-2xl text-[15px] leading-7 text-[var(--color-ink-soft)]">
              {copy.proofDescription}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {copy.trustLabels.map((label) => (
              <span
                key={`proof-${label}`}
                className="rounded-full border border-[var(--color-line)] bg-white/78 px-3 py-1.5 text-xs font-semibold text-[var(--color-ink-soft)]"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-3">
            {copy.proofPoints.map((point, index) => {
              const Icon = proofIcons[index] ?? CheckCircle2;

              return (
                <article
                  key={point.title}
                  className="rounded-[1.8rem] border border-[var(--color-line)] bg-white/78 p-6"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]">
                    <Icon aria-hidden="true" className="h-5 w-5" focusable="false" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{point.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-[var(--color-ink-soft)]">
                    {point.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
