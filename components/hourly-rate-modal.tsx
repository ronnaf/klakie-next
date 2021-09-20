import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import React from "react";

type Props = {
  isOpen: boolean;
  onSave: (e: React.SyntheticEvent) => void;
  onClose: () => void;
};

export const HourlyRateModal = ({ isOpen, onSave, onClose }: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={onSave}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit hourly rate</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Input name="rate" type="number" step="any" placeholder="Enter your hourly rate" />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} type="submit">
              Save
            </Button>
            <Button onClick={onClose} type="button">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};
