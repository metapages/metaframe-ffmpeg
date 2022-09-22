import { FileValidated } from "@dropzone-ui/react";
import create from "zustand";
import localForage from "localforage";
import { FFmpeg } from "@ffmpeg/ffmpeg";

export type Mode = "idle" | "running" | "cancelled" | "error" | "success";

interface FilesState {
  cachedFiles: string[];
  setCachedFiles: (filenames: string[]) => void;
  getCachedFile: (filename: string) => Promise<File>;
  cacheFile: (filename: string) => void;
  syncCachedFiles: () => void;
  getFile: (filename: string) => Promise<File>;

  uploadedFiles: FileValidated[];
  setUploadedFiles: (files: FileValidated[]) => Promise<void>;
  addUploadedFile: (file: FileValidated) => Promise<void>;

  deleteFile: (filename: string) => Promise<void>;
  deleteAllFiles: () => Promise<void>;

  mode: Mode;
  setMode: (mode: Mode) => void;

  ffmpeg: FFmpeg | undefined;
  setFFmpeg: (ffmpeg: FFmpeg) => void;

  ffmpegInputFiles: Set<string>;
  toggleFFMpegInputFile: (filename: string) => ((_?: any) => void);

  error: string | null;
  setError: (error: string | null) => void;
}

export const useFileStore = create<FilesState>((set, get) => ({
  cachedFiles: [],
  setCachedFiles: (files: string[]) => set((state) => ({ cachedFiles: files })),
  getCachedFile: async (filename: string) => {
    return Promise.resolve(new File([""], filename));
  },

  getFile: async (filename: string) => {
    const uploadedFile = get().uploadedFiles.find(
      (file) => file.file.name === filename
    );
    if (uploadedFile) {
      return uploadedFile.file;
    }
    if (get().cachedFiles.includes(filename)) {
      const fileFromCache: File | undefined | null = await localForage.getItem(
        filename
      );
      if (fileFromCache) {
        return fileFromCache;
      }
    }
    throw `File not found: ${filename}`;
  },

  cacheFile: async (filename: string) => {
    const cachedFiles = [...get().cachedFiles];
    if (cachedFiles.includes(filename)) {
      return;
    }

    const uploadedFile = get().uploadedFiles.find(
      (f) => f.file.name === filename
    );
    if (!uploadedFile) {
      // not really how to handle this or how it could happen
      return;
    }

    try {
      await localForage.setItem(uploadedFile.file.name, uploadedFile.file);
      cachedFiles.push(uploadedFile.file.name);
      set((state) => ({
        cachedFiles,
      }));
    } catch (err) {
      console.log(err);
    }
  },

  syncCachedFiles: async () => {
    const keys = await localForage.keys();
    const cachedFiles = get().cachedFiles;
    const fileSet = new Set<string>([...cachedFiles, ...keys]);

    const sortedKeys = Array.from(fileSet.keys());
    sortedKeys.sort();

    set((state) => ({
      cachedFiles: sortedKeys,
    }));
  },

  uploadedFiles: [],
  setUploadedFiles: async (files: FileValidated[]) => {
    set((state) => ({ uploadedFiles: files }));
  },
  addUploadedFile: async (file: FileValidated) =>
    set((state) => ({
      // overwrite if already exists
      uploadedFiles: [
        ...state.uploadedFiles.filter((f) => f.file.name !== file.file.name),
        file,
      ],
    })),

  deleteFile: async (filename: string) => {
    const cachedFiles = [...get().cachedFiles];

    if (cachedFiles.includes(filename)) {
      cachedFiles.splice(cachedFiles.indexOf(filename), 1);
      try {
        await localForage.removeItem(filename);
        console.log("file deleted", filename);
      } catch (err) {
        console.log(err);
      }
    }

    set((state) => ({
      cachedFiles,
      uploadedFiles: state.uploadedFiles.filter(
        (file) => file!.file.name !== filename
      ),
    }));
  },

  deleteAllFiles: async () => {
    get().cachedFiles.forEach(async (filename) => {
      try {
        await localForage.removeItem(filename);
        console.log("file deleted", filename);
      } catch (err) {
        console.log(err);
      }
    });

    set((state) => ({
      cachedFiles: [],
      uploadedFiles: [],
    }));

    return Promise.resolve();
  },

  mode: "idle",
  setMode: (mode: Mode) => set((state) => ({ mode })),

  ffmpeg: undefined,
  setFFmpeg: (ffmpeg: FFmpeg) => set((state) => ({ ffmpeg })),

  ffmpegInputFiles: new Set(),
  toggleFFMpegInputFile: (filename: string) => {
    return (_?: any) => {
      const copy = new Set(get().ffmpegInputFiles);
      get().ffmpegInputFiles.has(filename)
      ? copy.delete(filename)
      : copy.add(filename);
      set((state) => ({ ffmpegInputFiles: copy }));
    }
  },

  error: null,
  setError: (error: string | null) => set((state) => ({ error })),
}));
