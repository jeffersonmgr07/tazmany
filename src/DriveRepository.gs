function getTazmanyDriveFolder_() {
  var folderId = PropertiesService.getScriptProperties().getProperty(TAZMANY_CONFIG.SCRIPT_PROPERTIES.DRIVE_FOLDER_ID);
  if (!folderId) throw new Error('Tazmany Drive folder is not configured. Run setupTazmany().');
  return DriveApp.getFolderById(folderId);
}

function getDriveFileDescriptor_(fileId) {
  assertSafeId_(fileId, 'fileId');
  var file = DriveApp.getFileById(fileId);
  return { id: file.getId(), name: file.getName(), mimeType: file.getMimeType(), size: file.getSize() };
}
