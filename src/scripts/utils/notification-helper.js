// src\scripts\utils\notification-helper.js
import { convertBase64ToUint8Array } from "./index";
import { VAPID_PUBLIC_KEY } from "../config";
import {
  subscribePushNotification,
  unsubscribePushNotification,
} from "../data/api";

export function isNotificationAvailable() {
  return "Notification" in window;
}

export function isNotificationGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API unsupported.");
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === "denied") {
    alert("Izin notifikasi ditolak.");
    return false;
  }

  if (status === "default") {
    alert("Izin notifikasi ditutup atau diabaikan.");
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    alert("Sudah berlangganan push notification.");
    return;
  }

  console.log("Mulai berlangganan push notification...");

  const failureSubscribeMessage =
    "Langganan push notification gagal diaktifkan.";
  const successSubscribeMessage =
    "Langganan push notification berhasil diaktifkan.";

  let pushSubscription;

  try {
    const registration = await navigator.serviceWorker.ready;
    pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions()
    );

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await subscribePushNotification({ endpoint, keys });

    if (!response.ok) {
      console.error("subscribe: response:", response);
      alert(failureSubscribeMessage);

      // Undo subscribe to push notification
      await pushSubscription.unsubscribe();

      return;
    }

    alert(successSubscribeMessage);
  } catch (error) {
    console.error("subscribe: error:", error);
    alert(failureSubscribeMessage);

    // Undo subscribe to push notification
    await pushSubscription.unsubscribe();
  }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage =
    "Langganan push notification gagal dinonaktifkan.";
  const successUnsubscribeMessage =
    "Langganan push notification berhasil dinonaktifkan.";
  try {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
      alert(
        "Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya."
      );
      return;
    }
    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await unsubscribePushNotification({ endpoint });
    if (!response.ok) {
      alert(failureUnsubscribeMessage);
      console.error("unsubscribe: response:", response);
      return;
    }
    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      alert(failureUnsubscribeMessage);
      await subscribePushNotification({ endpoint, keys });
      return;
    }
    alert(successUnsubscribeMessage);
  } catch (error) {
    alert(failureUnsubscribeMessage);
    console.error("unsubscribe: error:", error);
  }
}

export async function notifyStoryCreated(storyDescription) {
  try {
    const notificationData = {
      title: "Story berhasil dibuat",
      body: `Anda telah membuat story baru dengan deskripsi: ${storyDescription}`,
    };

    // Display a browser notification if permissions are granted
    if (isNotificationGranted()) {
      new Notification(notificationData.title, {
        body: notificationData.body,
      });

      console.log("Local notification displayed successfully");
      return true;
    } else {
      console.log("Notification permission not granted");
      return false;
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
}
