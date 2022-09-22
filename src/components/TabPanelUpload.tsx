import { useCallback } from "react";
import { VStack } from "@chakra-ui/react";
import { Dropzone, FileItem, FileValidated } from "@dropzone-ui/react";
import { useFileStore } from "../store";

export const TabPanelUpload: React.FC = () => {
  const files = useFileStore((state) => state.uploadedFiles);
  const setFiles = useFileStore((state) => state.setUploadedFiles);

  const updateFiles = useCallback(
    async (incomingFiles: FileValidated[]) => {
      // no spaces in file names, avoid bugs
      for (const file of incomingFiles) {
        const buffer = await file.file.arrayBuffer();
        file.file = new File([buffer], file.file.name.replaceAll(" ", "-"), {
          type: file.file.type,
        });
      }
      setFiles(incomingFiles);
    },
    [setFiles]
  );

  const removeFile = useCallback(
    (id: string | number | undefined) => {
      setFiles(files.filter((x) => x.file.name !== id));
    },
    [files, setFiles]
  );

  return (
    <VStack>
      {/* @ts-ignore */}
      <Dropzone
        style={{ minWidth: "505px" }}
        onChange={updateFiles}
        value={files}
        maxFilesize={1000}
        accept="video/*, .h264, .avi, .mp4, .mov, .mkv, .flv, .wmv, .webm, .mpeg, .mpg, .m4v, .3gp, .3g2, .f4v, .f4p, .f4a, .f4b"
      >
        {files.length > 0 &&
          files.map((file, i) => (
            <FileItem {...file} onDelete={removeFile} key={i} info />
          ))}
      </Dropzone>
    </VStack>
  );
};
