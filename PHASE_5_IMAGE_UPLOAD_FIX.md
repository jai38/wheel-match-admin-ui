I've updated the frontend to match your backend changes for handling image uploads. This should resolve the 413 CloudFront error by uploading images directly to S3 using presigned URLs.

**Changes made:**

1.  **Updated `src/lib/api/services/alloys.ts`:**
    *   Refactored `uploadAlloyImages` to follow the 3-step flow:
        1.  `POST /admin/alloys/images/upload-url` to get the upload URL.
        2.  `PUT` the file directly to S3 (bypassing the API server).
        3.  `POST /admin/alloys/:id/images/metadata` to save the image record.

2.  **Updated `src/lib/api/services/cars.ts`:**
    *   Applied the same refactoring to `uploadCarImages` using the `/admin/cars/...` endpoints, as per your example.

3.  **Verification:**
    *   Ran a type check (`tsc`) to ensure the changes are compatible with your existing components (`AlloyImagesForm` and `CarForm`), which rely on these services. The build passed successfully.

The `AlloyImagesForm` and `CarForm` components will now automatically use this new upload logic without needing any changes themselves.