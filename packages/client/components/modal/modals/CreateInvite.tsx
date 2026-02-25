import { Show, createSignal, onMount } from "solid-js";

import { Trans } from "@lingui-solid/solid/macro";
import { useMutation } from "@tanstack/solid-query";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { CONFIGURATION } from "@revolt/common";
import { Dialog, DialogProps } from "@revolt/ui";

import { useModals } from "..";
import { Modals } from "../types";

/**
 * Code block which displays invite
 */
const Invite = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",

    "& code": {
      padding: "12px 16px",
      userSelect: "all",
      fontSize: "1.1em",
      textAlign: "center",
      fontFamily: "var(--fonts-monospace)",
      background: "var(--md-sys-color-surface-container-highest)",
      borderRadius: "8px",
      color: "var(--md-sys-color-primary)",
      wordBreak: "break-all",
    },
  },
});

/**
 * Modal to create a new invite
 */
export function CreateInviteModal(
  props: DialogProps & Modals & { type: "create_invite" },
) {
  const { showError } = useModals();
  const [link, setLink] = createSignal("...");
  const [copied, setCopied] = createSignal(false);

  const fetchInvite = useMutation(() => ({
    mutationFn: () =>
      props.channel
        .createInvite()
        .then(({ _id }) =>
          setLink(
            CONFIGURATION.IS_STOAT
              ? `https://stt.gg/${_id}`
              : `${window.location.protocol}//${window.location.host}/invite/${_id}`,
          ),
        ),
    onError: showError,
  }));

  onMount(() => fetchInvite.mutate());

  function copyLink() {
    navigator.clipboard.writeText(link());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    return false;
  }

  function shareLink() {
    if (navigator.share) {
      navigator.share({
        title: `Join ${props.channel.name ?? "my server"} on Stoat`,
        url: link(),
      });
    } else {
      copyLink();
    }
    return false;
  }

  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      title={<Trans>Invite Friends</Trans>}
      actions={[
        { text: <Trans>Done</Trans> },
        {
          text: copied() ? <Trans>✓ Copied!</Trans> : <Trans>Copy Link</Trans>,
          onClick: copyLink,
        },
        ...("share" in navigator
          ? [
            {
              text: <Trans>Share</Trans>,
              onClick: shareLink,
            },
          ]
          : []),
      ]}
    >
      <Show
        when={!fetchInvite.isPending}
        fallback={<Trans>Generating invite…</Trans>}
      >
        <Invite>
          <span
            class={css({
              fontSize: "13px",
              color: "var(--md-sys-color-on-surface-variant)",
            })}
          >
            <Trans>
              Send this link to a friend to grant access to{" "}
              <strong>#{props.channel.name}</strong>:
            </Trans>
          </span>
          <code>{link()}</code>
        </Invite>
      </Show>
    </Dialog>
  );
}

