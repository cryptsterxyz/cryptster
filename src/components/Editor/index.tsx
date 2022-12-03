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
import React from "react";

const TRANSFORMERS = [...TEXT_FORMAT_TRANSFORMERS];

const Editor = (
  props: JSX.IntrinsicAttributes &
    HTMLAttributes<HTMLDivElement> & {
      viewOnly?: boolean;
      hidePlaceholder?: boolean;
    }
): JSX.Element => {
  // const setPublicationContent = usePublicationStore((state) => state.setPublicationContent);
  const { viewOnly } = props;
  return (
    <div {...props} className={clsx("relative", props.className)}>
      {viewOnly && <ToolbarPlugin />}

      <RichTextPlugin
        contentEditable={
          <ContentEditable className="px-5 block my-4 min-h-[65px] h-4/5 overflow-auto" />
        }
        placeholder={
          props?.hidePlaceholder ? (
            <React.Fragment />
          ) : !viewOnly ? (
            <div className="px-5 absolute top-[65px] text-gray-400 pointer-events-none whitespace-nowrap">
              What's happening?
            </div>
          ) : (
            <div></div>
          )
        }
        ErrorBoundary={() => <div>error</div>}
      />
      <OnChangePlugin
        onChange={(editorState) => {
          editorState.read(() => {
            const markdown = $convertToMarkdownString(TRANSFORMERS);
            props?.onChange(markdown);
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
