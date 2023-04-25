/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../.astro/types.d.ts" />
/// <reference types="@astrojs/image/client" />

declare module 'react-modal-image' {
  export default function ModalImage(props: {
    small?: string;
    medium?: string;
    large?: string;
    smallSrcSet?: string;
    hideDownload?: boolean;
    hideZoom?: boolean;
    showRotate?: boolean;
    imageBackgroundColor?: string;
    alt?: string;
    className?: string;
  }): JSX.Element;
}
