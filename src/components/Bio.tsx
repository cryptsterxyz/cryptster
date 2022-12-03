import Editor from "./Editor";
import withEditorContext from "./Editor/withLexicalContext";

const Bio = ({ form }: { form: any }) => {
  return (
    <Editor
      hidePlaceholder
      className="ring-1 rounded-md w-full text-white"
      onChange={(e) => {
        form.setValue("bio", e);
      }}
    />
  );
};

export default withEditorContext(Bio);
