import Editor from "./Editor";
import withEditorContext from "./Editor/withLexicalContext";

const Bio = ({ form, initialState }: { form: any; initialState: string }) => {
  return (
    <Editor
      initialState={initialState}
      hidePlaceholder
      className="ring-1 rounded-md w-full text-white"
      onChange={(e) => {
        form.setValue("bio", e);
      }}
    />
  );
};

export default Bio;
