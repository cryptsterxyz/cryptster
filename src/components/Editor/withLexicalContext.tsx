import { CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import type { FC } from "react";
import { EmojiNode } from "./nodes/EmojiNode";

const initialConfig = {
  namespace: "composer",
  theme: {
    text: {
      bold: "text-bold",
      italic: "text-italic",
      code: "text-sm bg-gray-300 rounded-lg dark:bg-gray-700 px-[5px] py-[2px]",
    },
    link: "text-brand",
    hashtag: "text-brand",
  },
  nodes: [CodeNode, HashtagNode, AutoLinkNode, LinkNode, EmojiNode],
  editorState: () => $convertFromMarkdownString(markdown, TRANSFORMERS),
  onError: (error: any) => {
    console.error(error);
  },
};

const withEditorContext = (Component: FC<any>) => {
  const EditorContext = (props: any) => (
    <LexicalComposer initialConfig={initialConfig}>
      <Component {...props} />
    </LexicalComposer>
  );

  EditorContext.displayName = "EditorContext";
  return EditorContext;
};

export default withEditorContext;
