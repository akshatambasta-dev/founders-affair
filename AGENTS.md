<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Colours: components use only semantic tokens from src/styles.css; sections opt into `.theme-dark`, `.theme-ivory` or `.theme-brand` — keeps palette swaps central.
- Custom cursor reads `data-cursor` (view|drag|cta) attributes; it is pointer-events:none and fine-pointer only — so it never blocks interaction.
