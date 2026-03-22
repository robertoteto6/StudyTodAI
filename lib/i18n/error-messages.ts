import { type AppDictionary } from "@/lib/i18n/dictionaries";

const errorKeyByMessage: Record<string, keyof AppDictionary["errors"]> = {
  "Authentication failed": "authenticationFailed",
  "Unable to sync session": "unableToSyncSession",
  "Missing Firebase session token": "unableToCreateSession",
  "Missing demo session token": "unableToCreateSession",
  "Unable to list projects": "unableToLoadProjects",
  "Unable to load projects": "unableToLoadProjects",
  "Unable to create project": "unableToSaveProject",
  "Unable to save project": "unableToSaveProject",
  "Invalid accent color": "unableToSaveProject",
  "Unable to update project": "unableToUpdateProject",
  "Unable to delete project": "unableToDeleteProject",
  "Unable to load project": "unableToLoadProject",
  "Unable to list messages": "unableToLoadMessages",
  "Unable to load messages": "unableToLoadMessages",
  "Unable to refresh project": "unableToRefreshProject",
  "Unable to load preview": "unableToLoadPreview",
  "Unable to upload documents": "unableToUploadDocuments",
  "Unable to upload files": "unableToUploadDocuments",
  "Unable to upload file": "unableToUploadDocuments",
  "Unable to send message": "unableToSendMessage",
  "Project not found": "projectNotFound",
  "Document not found": "documentNotFound",
  "Archive the project before deleting it permanently": "archiveBeforeDelete",
  "Unsupported file type": "unsupportedFileType",
  "Missing files": "missingFiles",
  "Unable to create session": "unableToCreateSession",
  "Missing authorization": "missingAuthorization",
  "Demo authentication is disabled": "authenticationFailed",
  "Unable to load asset": "unableToLoadAsset",
  "Unable to generate answer": "unableToGenerateAnswer",
};

export function localizeErrorMessage(
  message: string,
  dictionary: AppDictionary["errors"],
) {
  const key = errorKeyByMessage[message];
  return key ? dictionary[key] : message;
}
