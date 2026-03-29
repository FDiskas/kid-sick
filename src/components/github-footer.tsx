import { translate } from "@/lib/translate"

export function GitHubFooter() {
  return (
    <footer className="border-t bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-4 px-4 py-3 sm:px-6">
        <a
          href="https://github.com/FDiskas/kid-sick"
          target="_blank"
          rel="noreferrer"
          aria-label={translate.viewOnGithub}
          title={translate.viewOnGithub}
          className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5 fill-current"
          >
            <path d="M12 1.5C6.201 1.5 1.5 6.201 1.5 12c0 4.641 3.007 8.58 7.182 9.969.525.096.717-.228.717-.507 0-.249-.009-.909-.015-1.785-2.922.635-3.54-1.407-3.54-1.407-.477-1.212-1.164-1.536-1.164-1.536-.951-.651.072-.639.072-.639 1.053.075 1.608 1.083 1.608 1.083.936 1.605 2.454 1.141 3.051.873.096-.678.366-1.14.666-1.401-2.334-.267-4.788-1.167-4.788-5.196 0-1.149.411-2.088 1.083-2.823-.108-.267-.468-1.341.102-2.796 0 0 .882-.282 2.889 1.078A10.066 10.066 0 0 1 12 6.588c.894.003 1.794.12 2.637.351 2.007-1.36 2.887-1.078 2.887-1.078.573 1.455.213 2.529.105 2.796.675.735 1.08 1.674 1.08 2.823 0 4.041-2.457 4.926-4.797 5.187.375.321.711.954.711 1.923 0 1.389-.012 2.508-.012 2.85 0 .282.189.609.723.504A10.503 10.503 0 0 0 22.5 12c0-5.799-4.701-10.5-10.5-10.5Z" />
          </svg>
        </a>
        <a
          href="/privacy-policy.html"
          target="_blank"
          rel="noreferrer"
          aria-label={translate.viewPrivacyPolicy}
          title={translate.viewPrivacyPolicy}
          className="text-sm text-muted-foreground underline transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {translate.privacyPolicy}
        </a>
      </div>
    </footer>
  )
}
