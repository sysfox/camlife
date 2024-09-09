"use client"

import { SlideshowLightbox, initLightboxJS } from "lightbox.js-react"
import "lightbox.js-react/dist/index.css"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { ThreeDot } from "react-loading-indicators"
import { PhotoInfo } from "~/components/photo-info"
import { CardBody, CardContainer, CardItem } from "~/components/ui/3d-card"
import { useView } from "~/store/useView"
import { api } from "~/trpc/react"

const styles = {
  container: {
    grid: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    waterfall: "columns-1 sm:columns-2 md:columns-3 xl:columns-4 md:gap-6",
    default: "flex flex-col items-center",
  },
  image: {
    grid: "w-[600px] h-[200px] object-cover transition-transform duration-300 ease-in-out hover:scale-105",
    waterfall: "md:mb-6 break-inside-avoid md:rounded-xl hover:shadow-xl",
    default: "md:rounded-xl",
  },
}

const getAdjustedDimensions = (
  width: number,
  height: number,
): { width: number; height: number } => {
  return height > width
    ? { width: Math.floor(800 * (width / height)), height: 800 }
    : { width, height }
}

export function View() {
  const { view } = useView()
  const { resolvedTheme } = useTheme()
  const [loadingColor, setLoadingColor] = useState<string | undefined>()

  useEffect(() => {
    setLoadingColor(resolvedTheme === "dark" ? "#ffffff" : "#000000")
  }, [resolvedTheme])

  useEffect(() => {
    // https://www.getlightboxjs.com/nextjs/
    initLightboxJS("6CDB-34FD-F513-A6FC", "individual")
  })

  const { data: photos, isLoading } = api.photos.getAllPhotos.useQuery()

  const lightboxTheme = resolvedTheme === "dark" ? "night" : "day"

  const lightboxImages = useMemo(
    () => photos?.map(({ url, title }) => ({ src: url, alt: title ?? "照片" })),
    [photos],
  )

  if (isLoading)
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <ThreeDot variant="pulsate" color={loadingColor} size="medium" />
      </div>
    )

  return (
    <div className="md:px-32">
      <SlideshowLightbox
        key={view}
        theme={lightboxTheme}
        lightboxIdentifier="lightbox"
        framework="next"
        imgAnimation="fade"
        modalClose="clickOutside"
        showThumbnails
        showControls={false}
        images={lightboxImages}
      >
        <div
          className={
            styles.container[view as keyof typeof styles.container] ||
            styles.container.default
          }
        >
          {photos?.map((photo) => {
            const { width, height } = getAdjustedDimensions(
              photo.width,
              photo.height,
            )
            const imageProps = {
              className:
                styles.image[view as keyof typeof styles.image] ||
                styles.image.default,
              src: photo.url,
              width: view === "grid" ? 600 : width,
              height: view === "grid" ? 200 : height,
              placeholder: "blur",
              blurDataURL: photo.blurData ?? "",
              loading: "lazy",
              style: view === "grid" ? { objectFit: "cover" } : undefined,
            }

            return view === "waterfall" ? (
              <CardContainer containerClassName="py-0" key={photo.id}>
                <CardBody className="h-auto w-auto">
                  <CardItem translateZ="50">
                    {/* eslint-disable-next-line */}
                    {/* @ts-ignore */}
                    <Image
                      {...imageProps}
                      alt={photo.title ?? ""}
                      data-lightboxjs="lightbox"
                    />
                  </CardItem>
                </CardBody>
              </CardContainer>
            ) : (
              <>
                {/* eslint-disable-next-line */}
                {/* @ts-ignore */}
                <Image
                  key={photo.id}
                  {...imageProps}
                  alt={photo.title ?? ""}
                  data-lightboxjs="lightbox"
                />
                {view === "feed" && <PhotoInfo {...photo} />}
              </>
            )
          })}
        </div>
      </SlideshowLightbox>
    </div>
  )
}
