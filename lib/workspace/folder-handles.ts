const databaseName = "markdownviewer-folder-workspace-v1";
const storeName = "handles";
const rootHandleKey = "root";

function openFolderDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available."));
      return;
    }

    const request = indexedDB.open(databaseName, 1);

    request.onerror = () => reject(request.error ?? new Error("Could not open folder workspace database."));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName);
    };
  });
}

function runStoreOperation<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | undefined> {
  return openFolderDatabase().then(
    (database) =>
      new Promise<T | undefined>((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = operation(store);
        let result: T | undefined;

        if (request) {
          request.onsuccess = () => {
            result = request.result;
          };
          request.onerror = () => reject(request.error ?? new Error("Folder workspace database request failed."));
        }

        transaction.oncomplete = () => {
          database.close();
          resolve(result);
        };
        transaction.onerror = () => {
          database.close();
          reject(transaction.error ?? new Error("Folder workspace database transaction failed."));
        };
        transaction.onabort = () => {
          database.close();
          reject(transaction.error ?? new Error("Folder workspace database transaction aborted."));
        };
      })
  );
}

export async function saveRootFolderHandle(handle: FileSystemDirectoryHandle) {
  await runStoreOperation("readwrite", (store) => store.put(handle, rootHandleKey));
}

export async function readRootFolderHandle() {
  return (await runStoreOperation<FileSystemDirectoryHandle>("readonly", (store) =>
    store.get(rootHandleKey)
  )) ?? null;
}

export async function clearRootFolderHandle() {
  await runStoreOperation("readwrite", (store) => store.delete(rootHandleKey));
}
