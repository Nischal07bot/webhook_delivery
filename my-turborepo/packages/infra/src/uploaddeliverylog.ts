import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3";

export async function uploadDeliveryLog(params: {
  projectId: string;
  eventId: string;
  deliveryId: string;
  attempt: number;
  payload: unknown;
}) {
  const key = [
    `project_${params.projectId}`,
    `event_${params.eventId}`,
    `delivery_${params.deliveryId}`,
    `attempt_${params.attempt}.json`,
  ].join("/");

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Body: JSON.stringify(params.payload, null, 2),
      ContentType: "application/json",
    })
  );

  return key;
}
