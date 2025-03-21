// @ts-strict-ignore
import ActionDialog from "@dashboard/components/ActionDialog";
import { useChannelsSearch } from "@dashboard/components/ChannelsAvailabilityDialog/utils";
import { Combobox } from "@dashboard/components/Combobox";
import { IMessage } from "@dashboard/components/messages";
import { useGiftCardPermissions } from "@dashboard/giftCards/hooks/useGiftCardPermissions";
import { useChannelsQuery, useGiftCardResendMutation } from "@dashboard/graphql";
import useForm from "@dashboard/hooks/useForm";
import useNotifier from "@dashboard/hooks/useNotifier";
import { getBySlug } from "@dashboard/misc";
import { DialogProps } from "@dashboard/types";
import commonErrorMessages from "@dashboard/utils/errors/common";
import { mapSlugNodeToChoice } from "@dashboard/utils/maps";
import { Box, Checkbox, Input, Spinner, Text } from "@saleor/macaw-ui-next";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { getGiftCardErrorMessage } from "../messages";
import useGiftCardDetails from "../providers/GiftCardDetailsProvider/hooks/useGiftCardDetails";
import { giftCardResendCodeDialogMessages as messages } from "./messages";
import { useDialogFormReset } from "./utils";

export interface GiftCardResendCodeFormData {
  email: string;
  channelSlug: string;
}

const GiftCardResendCodeDialog: React.FC<DialogProps> = ({ open, onClose }) => {
  const intl = useIntl();
  const notify = useNotifier();
  const {
    giftCard: { boughtInChannel: initialChannelSlug },
  } = useGiftCardDetails();
  const { canManageChannels } = useGiftCardPermissions();
  const [consentSelected, setConsentSelected] = useState(false);
  const { data: channelsData, loading: loadingChannels } = useChannelsQuery({
    skip: !canManageChannels,
  });
  const channels = channelsData?.channels;
  const activeChannels = channels?.filter(({ isActive }) => isActive);
  const { onQueryChange, filteredChannels } = useChannelsSearch(activeChannels);
  const initialFormData: GiftCardResendCodeFormData = {
    email: "",
    channelSlug: initialChannelSlug || "",
  };
  const {
    giftCard: { id },
  } = useGiftCardDetails();
  const handleSubmit = async ({ email, channelSlug }: GiftCardResendCodeFormData) => {
    const result = await resendGiftCardCode({
      variables: {
        input: {
          id,
          email: email || null,
          channel: channelSlug,
        },
      },
    });

    return result?.data?.giftCardResend?.errors;
  };
  const { data, change, submit, reset } = useForm(initialFormData, handleSubmit);
  const [resendGiftCardCode, resendGiftCardCodeOpts] = useGiftCardResendMutation({
    onCompleted: data => {
      const errors = data?.giftCardResend?.errors;
      const notifierData: IMessage = errors?.length
        ? {
            status: "error",
            text: intl.formatMessage(commonErrorMessages.unknownError),
          }
        : {
            status: "success",
            text: intl.formatMessage(messages.successResendAlertText),
          };

      notify(notifierData);

      if (!errors.length) {
        onClose();
        reset();
      }
    },
  });
  const { loading, status, data: submitData } = resendGiftCardCodeOpts;
  const { formErrors } = useDialogFormReset({
    open,
    reset,
    apiErrors: submitData?.giftCardResend?.errors,
    keys: ["email"],
  });

  useEffect(reset, [consentSelected]);

  return (
    <ActionDialog
      open={open}
      onConfirm={submit}
      confirmButtonLabel={intl.formatMessage(messages.submitButtonLabel)}
      onClose={onClose}
      title={intl.formatMessage(messages.title)}
      confirmButtonState={status}
      disabled={loading}
    >
      {loadingChannels ? (
        <Box display="flex" width="100%" justifyContent="center">
          <Spinner />
        </Box>
      ) : (
        <Box display="grid" gap={2}>
          <Text>{intl.formatMessage(messages.description)}</Text>

          <Combobox
            label={intl.formatMessage(messages.sendToChannelSelectLabel)}
            options={mapSlugNodeToChoice(filteredChannels)}
            fetchOptions={onQueryChange}
            name="channelSlug"
            value={{
              label: channels?.find(getBySlug(data?.channelSlug))?.name,
              value: data?.channelSlug,
            }}
            onChange={change}
          />
          <Checkbox
            name="differentMailConsent"
            checked={consentSelected}
            onCheckedChange={value => setConsentSelected(value as boolean)}
          >
            <Text fontSize={3}>{intl.formatMessage(messages.consentCheckboxLabel)}</Text>
          </Checkbox>
          <Input
            disabled={!consentSelected}
            error={!!formErrors?.email}
            helperText={getGiftCardErrorMessage(formErrors?.email, intl)}
            name="email"
            value={data.email}
            onChange={change}
            label={intl.formatMessage(messages.emailInputPlaceholder)}
            width="100%"
          />
        </Box>
      )}
    </ActionDialog>
  );
};

export default GiftCardResendCodeDialog;
