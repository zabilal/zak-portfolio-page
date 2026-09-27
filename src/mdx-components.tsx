import type { MDXComponents } from "mdx/types";
import { highlight } from "sugar-high";

/** Global MDX components. Code blocks are highlighted at build time; no client JS. */
const components: MDXComponents = {
  code: ({ children, className, ...props }) => {
    if (
      typeof children !== "string" ||
      !className?.startsWith("language-") ||
      className === "language-text"
    ) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className={className}
        dangerouslySetInnerHTML={{ __html: highlight(children) }}
        {...props}
      />
    );
  },
};

export function useMDXComponents(): MDXComponents {
  return components;
}
