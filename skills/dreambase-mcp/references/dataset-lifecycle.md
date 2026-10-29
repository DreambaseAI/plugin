# Dataset lifecycle


promote_dataset clears a verified scratch dataset's expiry and starts durable-storage usage and daily source refresh. Before calling, name the dataset, the verification limits, the storage usage and daily execution, and that promotion currently cannot be undone; wait for a separate affirmative reply. Do not invent a numeric cost quote. update_dataset_schedule can disable or move the daily refresh.

refresh_dataset replays the saved definition only when the user asks for fresh rows. Verify afterward. save_dataset with datasetId changes the definition; a dataset linked to a UI collection refuses redefinition. Keep the stored definition or save a separate scratch dataset.


## Recovery


Writes may execute a source or persist a record before a timeout. Never blind-retry: inspect the corresponding list/get state first. A name match alone is not proof of identity. Saving to the same datasetId does not make an external action idempotent. Explain unresolved ambiguity.

On NOT_FOUND, check workspace and IDs. On FORBIDDEN, relay the required scope, role, plan or availability. On an unscanned source, direct an admin to the app rather than retrying. Correct a deterministic validation error only when re-execution is safe. Reauthorize on UNAUTHENTICATED. For promotion conflicts, re-read and re-verify the snapshot before seeking consent again.
