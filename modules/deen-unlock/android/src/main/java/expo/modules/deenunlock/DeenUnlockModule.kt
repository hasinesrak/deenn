package expo.modules.deenunlock

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DeenUnlockModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DeenUnlock")

    OnCreate {
      val context = appContext.reactContext ?: return@OnCreate
      UnlockReceiverRegistration.register(context)
    }

    AsyncFunction("configure") { payload: Map<String, Any?> ->
      val context = appContext.reactContext ?: return@AsyncFunction
      DeenUnlockStore.save(
        context = context,
        enabled = payload["enabled"] as? Boolean ?: false,
        mode = payload["mode"] as? String ?: "random",
        pronunciation = payload["pronunciation"] as? String ?: "english",
        meaningLanguage = payload["meaningLanguage"] as? String ?: "english",
        lastShownVerseId = (payload["lastShownVerseId"] as? Number)?.toInt() ?: 0,
        sequentialVerseId = (payload["sequentialVerseId"] as? Number)?.toInt() ?: 1,
        sequentialCompleted = payload["sequentialCompleted"] as? Boolean ?: false,
        dbPath = payload["dbPath"] as? String ?: ""
      )
      UnlockReceiverRegistration.register(context)
    }

    AsyncFunction("getNativeProgress") {
      val context = appContext.reactContext ?: return@AsyncFunction null
      val lastShownAt = DeenUnlockStore.lastShownAt(context)
      if (lastShownAt == 0L) {
        return@AsyncFunction null
      }
      mapOf(
        "lastShownVerseId" to DeenUnlockStore.lastShownVerseId(context),
        "sequentialVerseId" to DeenUnlockStore.sequentialVerseId(context),
        "sequentialCompleted" to DeenUnlockStore.sequentialCompleted(context),
        "lastShownAt" to lastShownAt
      )
    }
  }
}
