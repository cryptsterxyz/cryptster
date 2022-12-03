import {
  $convertToMarkdownString,
  TEXT_FORMAT_TRANSFORMERS,
} from "@lexical/markdown";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import type { ClassAttributes, FC, HTMLAttributes } from "react";
// import { usePublicationStore } from 'src/store/publication';

// import MentionsPlugin from './AtMentionsPlugin';
import AutoLinkPlugin from "./AutoLinkPlugin";
import EmojisPlugin from "./EmojisPlugin";
import EmojiPickerPlugin from "./EmojiPickerPlugin";
import ToolbarPlugin from "./ToolbarPlugin";
import clsx from "clsx";

const TRANSFORMERS = [...TEXT_FORMAT_TRANSFORMERS];

const Editor = (
  props: JSX.IntrinsicAttributes & HTMLAttributes<HTMLDivElement>
): JSX.Element => {
  // const setPublicationContent = usePublicationStore((state) => state.setPublicationContent);

  return (
    <div {...props} className={clsx("relative", props.className)}>
      <ToolbarPlugin />
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="px-5 block my-4 min-h-[65px] h-4/5 overflow-auto" />
        }
        placeholder={
          <div className="px-5 absolute top-[65px] text-gray-400 pointer-events-none whitespace-nowrap">
            What's happening?
          </div>
        }
        ErrorBoundary={() => <div>error</div>}
      />
      <OnChangePlugin
        onChange={(editorState) => {
          editorState.read(() => {
            const markdown = $convertToMarkdownString(TRANSFORMERS);
            // setPublicationContent(markdown);
          });
        }}
      />
      <AutoLinkPlugin />
      <EmojisPlugin />
      <EmojiPickerPlugin />
      <HistoryPlugin />
      <HashtagPlugin />
      {/* <MentionsPlugin /> */}
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
    </div>
  );
};

export default Editor;
