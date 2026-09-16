package expo.modules.deenunlock

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build

object UnlockReceiverRegistration {
  private var receiver: DeenUnlockReceiver? = null

  @Synchronized
  fun register(context: Context) {
    if (receiver != null) {
      return
    }

    val next = DeenUnlockReceiver()
    val filter = IntentFilter(Intent.ACTION_USER_PRESENT)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      context.applicationContext.registerReceiver(next, filter, Context.RECEIVER_EXPORTED)
    } else {
      context.applicationContext.registerReceiver(next, filter)
    }
    receiver = next
  }
}
