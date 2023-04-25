// gallery reference: https://tailwind-elements.com/docs/standard/components/gallery/

import ModalImage from 'react-modal-image';

const modalCss =
  'block h-full w-full rounded-lg object-cover object-center transition-shadow duration-300 ease-in-out hover:shadow-lg hover:shadow-black/20';

export default function Gallery(props) {
  return (
    <>
      <div class="container mx-auto mb-20 px-5 py-2 lg:px-32 lg:pt-12">
        <div class="-m-1 flex flex-wrap md:-m-2">
          {props.images.map((image, index) => {
            return (
              <div key={index} className="flex w-1/3 flex-wrap">
                <div class="w-full p-1 md:p-2">
                  <ModalImage
                    small={image.small}
                    medium={image.medium}
                    large={image.large}
                    alt={image.alt}
                    className={modalCss}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
