import Card from "@components/Card";
import { object, string } from "zod";
import Input from "@components/Input";
import { useAppStore } from "@store/app";
import withAuthenticatedRoute from "@utils/withAuthenticatedRoute";
import { useProfileQuery } from "generated";
import getAvatar from "src/lib/getAvatar";
import { Form, useZodForm } from "@components/Form";
import Button from "@components/Button";
import Editor from "@components/Editor";
import withEditorContext from "@components/Editor/withLexicalContext";

const Profile = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const form = useZodForm({
    schema: object({
      name: string(),
      handle: string(),
      bio: string(),
      about: string(),
    }),
    defaultValues: {
      name: currentProfile?.name ?? "",
      handle: `cryptster.xyz/u/${currentProfile?.handle ?? ""}`,
      bio: currentProfile?.bio ?? "",
      about: "",
    },
  });
  console.log(currentProfile);
  return (
    <div className="bg-onboard flex flex-grow h-[60vh]">
      <Card className="ring-1 h-3/4 bg-gray-900  ring-slate-900/500 flex flex-col justify-center items-center onboard w-[70vw] m-auto text-white overflow-scroll">
        <Form
          form={form}
          className="w-full items-center flex flex-col"
          onSubmit={({ name, bio }) => {
            // console.log("dsdfsdf");
            // editProfile(name, bio);
          }}
        >
          <Input
            type={""}
            label="Name"
            placeholder="Name"
            {...form.register("name")}
          />
          <Input
            label="Your custom page URL"
            placeholder="cryptster/strek.lens"
            disabled
            {...form.register("handle")}
          />
          <Input label="Bio" placeholder="Bio" {...form.register("bio")} />
          <div className="form-control w-full max-w-md mx-auto mt-4">
            <h2 className="text-white">About</h2>
            <Editor className=" lexical-about h-[300px] ring-1 rounded-lg mt-2" />
          </div>
          <div className="m-auto pt-3">
            <Button
              //   disabled={isLoading}
              type="submit"
              variant="primary"
              className="mx-auto mt-3 max-w-xs"
            >
              {/* {isLoading && <LoaderIcon className="mr-2 h-4 w-4" />} */}
              continue
            </Button>
            {/* {txHash ? <IndexStatus txHash={txHash} /> : null} */}
          </div>
        </Form>
      </Card>
    </div>
    // <div className="magic-card container max-w-screen-xl flex-grow ring-1">
    //   <Card className="w-full bg-slate-800 h-full">
    //     <img
    //       src={getAvatar(currentProfile)}
    //       loading="lazy"
    //       className="w-10 h-10 bg-gray-200 rounded-full border dark:border-gray-700/80"
    //       height={40}
    //       width={40}
    //       alt={currentProfile?.handle}
    //     />
    //     <div className="flex ">{currentProfile.name}</div>
    //     <div className="flex ">{currentProfile.avatar}</div>
    //   </Card>
    // </div>
  );
};

export default withAuthenticatedRoute(Profile);
