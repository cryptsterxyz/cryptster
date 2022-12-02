import Button from "@components/Button";
import Modal from "@components/Modal";
// import { ArrowCircleRightIcon } from "@heroicons/react/outline";
import type { FC } from "react";
import { useState } from "react";

import Login from "../shared/Login";

const LoginButton: FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <Modal
        title="Login"
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      >
        <Login />
      </Modal>
      <Button
        onClick={() => {
          setShowLoginModal(!showLoginModal);
        }}
      >
        Login
      </Button>
    </>
  );
};

export default LoginButton;
