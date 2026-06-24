import { Container } from "./Container";

// 區塊外框:統一垂直節奏與可選標題。學院風以極細線分隔。
export function Section({
  id,
  heading,
  intro,
  children,
  bordered = false,
  className = "",
}: {
  id?: string;
  heading?: string;
  intro?: string;
  children?: React.ReactNode;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 py-16 sm:py-24 ${bordered ? "border-t border-line" : ""} ${className}`}
    >
      <Container>
        {heading && (
          <header className="mb-10 sm:mb-14">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {heading}
            </h2>
            {intro && (
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
                {intro}
              </p>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
