import supabase from './supabaseClient';

// Función para solicitar permisos de notificación y guardar la suscripción
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Guardar la suscripción en Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('push_subscriptions').upsert({
          user_id: user.id,
          subscription: subscription.toJSON()
        });
      }

      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al solicitar permisos de notificación:', error);
    return false;
  }
}

// Función para enviar una notificación
export async function sendNotification(userId: string, title: string, body: string, data?: any) {
  try {
    // Primero guardamos la notificación en la base de datos
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        content: body,
        data: data || {},
        read: false
      });

    if (notificationError) throw notificationError;

    // Luego enviamos la notificación push
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);

    if (subscriptions && subscriptions.length > 0) {
      // Aquí iría la lógica para enviar la notificación push al servidor
      // Esto requeriría un endpoint en tu backend que use web-push
      // Por ahora solo guardamos en la base de datos
    }
  } catch (error) {
    console.error('Error al enviar notificación:', error);
  }
}

// Función para marcar una notificación como leída
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
  }
} 