package expo.modules.deenunlock

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class DeenUnlockReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent?.action != Intent.ACTION_USER_PRESENT) {
      return
    }
    if (!DeenUnlockStore.isEnabled(context)) {
      return
    }

    val pending = goAsync()
    Thread {
      try {
        val verse = UnlockVerseSelector.select(context)
        if (verse != null) {
          UnlockNotifier.show(context, verse)
        }
      } finally {
        pending.finish()
      }
    }.start()
  }
}
