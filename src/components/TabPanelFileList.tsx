import { useEffect, useState } from "react";
import {
  Box,
  Code,
  IconButton,
  Switch,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useFileStore } from "../store";
import {
  DeleteIcon,
  DownloadIcon,
  CheckIcon,
  ArrowDownIcon,
} from "@chakra-ui/icons";

export const TabPanelFileList: React.FC = () => {
  const syncCachedFiles = useFileStore((state) => state.syncCachedFiles);
  const cachedFiles = useFileStore((state) => state.cachedFiles);
  const uploadedFiles = useFileStore((state) => state.uploadedFiles);

  useEffect(() => {
    syncCachedFiles();
  }, [syncCachedFiles]);

  const files: { name: string; cached: boolean }[] = [
    ...cachedFiles.map((file) => ({ name: file, cached: true })),
    ...uploadedFiles
      .filter((file) => !cachedFiles.includes(file.file.name))
      .map((file) => ({ name: file.file.name, cached: false })),
  ];

  return (
    <TableContainer>
      <Table size="sm" variant="simple">
        <TableCaption>
          Files selected for INPUTS are written to "inputs.txt" for{" "}
          <Code>ffmpeg -i inputs.txt</Code>
        </TableCaption>
        <Thead>
          <Tr>
            <Th>Inputs </Th>
            <Th>Name</Th>
            <Th>Cached</Th>
            <Th>Download</Th>
            <Th>Delete</Th>
          </Tr>
        </Thead>
        <Tbody>
          {files.map((file, i) => (
            <FileLineItem key={i} filename={file.name} cached={file.cached} />
          ))}
        </Tbody>
        <Tfoot></Tfoot>
      </Table>
    </TableContainer>
  );
};

const FileLineItem: React.FC<{ filename: string; cached: boolean }> = ({
  filename,
  cached,
}) => {
  const deleteFile = useFileStore((state) => state.deleteFile);
  const cacheFile = useFileStore((state) => state.cacheFile);
  const getFile = useFileStore((state) => state.getFile);
  const [objectUrl, setObjectUrl] = useState<string | undefined>();
  const isSelectedForFFMpegInput = useFileStore((state) =>
    state.ffmpegInputFiles.has(filename)
  );
  const toggleIsSelectedForFFMpegInput = useFileStore((state) =>
    state.toggleFFMpegInputFile(filename)
  );

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | undefined;
    (async () => {
      try {
        const file = await getFile(filename);
        if (cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(file);
        setObjectUrl(objectUrl);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) {
        // cleanup
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [filename, getFile, setObjectUrl]);

  return (
    <Tr>
      <Td>
        <Switch
          isChecked={isSelectedForFFMpegInput}
          onChange={toggleIsSelectedForFFMpegInput}
        />
      </Td>
      <Td>
        <Box>{filename}</Box>
      </Td>
      <Td>
        {cached ? (
          <CheckIcon color="green" />
        ) : (
          <IconButton
            aria-label="cache"
            onClick={() => cacheFile(filename)}
            icon={<ArrowDownIcon />}
          />
        )}
      </Td>
      <Td>
        {objectUrl ? (
          <a download={filename} href={objectUrl}>
            <IconButton
              aria-label="cache"
              onClick={() => cacheFile(filename)}
              icon={<DownloadIcon />}
            />
          </a>
        ) : null}
      </Td>

      <Td>
        <IconButton
          aria-label="delete"
          onClick={() => deleteFile(filename)}
          icon={<DeleteIcon />}
        />
      </Td>
    </Tr>
  );
};
