import { MetadataInput } from "@dashboard/graphql";
import { ChangeEvent } from "@dashboard/hooks/useForm";
import { removeAtIndex, updateAtIndex } from "@dashboard/utils/lists";
import { Box, BoxProps } from "@saleor/macaw-ui-next";
import React, { memo } from "react";

import { MetadataCard, MetadataCardProps } from "./MetadataCard";
import { MetadataLoadingCard } from "./MetadataLoadingCard";
import { EventDataAction, EventDataField } from "./types";
import { getDataKey, parseEventData } from "./utils";

export interface MetadataProps
  extends Omit<MetadataCardProps, "data" | "isPrivate">,
    Omit<BoxProps, `on${string}` | "data"> {
  data: {
    metadata: MetadataInput[];
    privateMetadata: MetadataInput[] | undefined;
  };
  isLoading?: boolean;
  readonly?: boolean;
  // This props is used to hide the private metadata section when user doesn't have enough permissions.
  hidePrivateMetadata?: boolean;
}

const propsCompare = (_: unknown, newProps: MetadataProps) => {
  /**
    If we pass `isLoading` render only when the loading finishes
  */
  if (typeof newProps.isLoading !== "undefined") {
    return newProps.isLoading;
  }

  /*
    If `isLoading` is not present, keep the old behavior
  */
  return false;
};

// TODO: Refactor loading state logic
// TODO: Split "Metadata" component into "Metadata" and "PrivateMetadata" components
export const MetadataNoMemo = ({
  data,
  onChange,
  isLoading,
  readonly = false,
  hidePrivateMetadata = false,
  ...props
}: MetadataProps) => {
  const change = (event: ChangeEvent, isPrivate: boolean) => {
    const { action, field, fieldIndex, value } = parseEventData(event);
    const key = getDataKey(isPrivate);
    const dataToUpdate = data[key] ?? [];

    onChange({
      target: {
        name: key,
        value:
          action === EventDataAction.update
            ? updateAtIndex(
                {
                  ...dataToUpdate[fieldIndex as number],
                  key:
                    field === EventDataField.name ? value : dataToUpdate[fieldIndex as number].key,
                  value:
                    field === EventDataField.value
                      ? value
                      : dataToUpdate[fieldIndex as number].value,
                },
                dataToUpdate,
                fieldIndex as number,
              )
            : action === EventDataAction.add
              ? [
                  ...dataToUpdate,
                  {
                    key: "",
                    value: "",
                  },
                ]
              : removeAtIndex(dataToUpdate, fieldIndex as number),
      },
    });
  };

  return (
    <Box display="grid" gap={2} paddingBottom={10} {...props}>
      {isLoading ? (
        <>
          <MetadataLoadingCard />
          {!hidePrivateMetadata && <MetadataLoadingCard isPrivate />}
        </>
      ) : (
        <>
          <MetadataCard
            data={data?.metadata}
            isPrivate={false}
            readonly={readonly}
            onChange={event => change(event, false)}
          />
          {(data?.privateMetadata || !hidePrivateMetadata) && (
            <MetadataCard
              data={data?.privateMetadata ?? []}
              isPrivate={true}
              readonly={readonly}
              onChange={event => change(event, true)}
            />
          )}
        </>
      )}
    </Box>
  );
};

export const Metadata = memo(MetadataNoMemo, propsCompare);
Metadata.displayName = "Metadata";
