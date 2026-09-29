package com.magiccastle.app;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@CapacitorPlugin(name = "MagicTextToSpeech")
public class MagicTextToSpeechPlugin extends Plugin {
    private TextToSpeech textToSpeech;
    private boolean initialized = false;
    private final Map<String, PluginCall> pendingCalls = new ConcurrentHashMap<>();

    @Override
    public void load() {
        textToSpeech = new TextToSpeech(getContext(), status -> initialized = status == TextToSpeech.SUCCESS);
        textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override
            public void onStart(String utteranceId) { }

            @Override
            public void onDone(String utteranceId) {
                finishCall(utteranceId, null);
            }

            @Override
            @Deprecated
            public void onError(String utteranceId) {
                finishCall(utteranceId, "系统朗读失败。");
            }

            @Override
            public void onError(String utteranceId, int errorCode) {
                finishCall(utteranceId, "系统朗读失败，错误代码：" + errorCode);
            }
        });
    }

    @PluginMethod
    public void isLanguageSupported(PluginCall call) {
        String language = call.getString("lang", "");
        int availability = languageAvailability(language);
        JSObject result = new JSObject();
        result.put("supported", availability >= TextToSpeech.LANG_AVAILABLE);
        result.put("missingData", availability == TextToSpeech.LANG_MISSING_DATA);
        call.resolve(result);
    }

    @PluginMethod
    public void openLanguageInstall(PluginCall call) {
        try {
            Intent intent = new Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception exception) {
            call.reject("无法打开系统语音安装页面。", exception);
        }
    }

    @PluginMethod
    public void speak(PluginCall call) {
        if (!initialized || textToSpeech == null) {
            call.reject("系统朗读引擎尚未准备好。");
            return;
        }

        String language = call.getString("lang", "en-US");
        int availability = languageAvailability(language);
        if (availability < TextToSpeech.LANG_AVAILABLE) {
            call.reject("当前设备没有可用的 " + language + " 朗读语音。");
            return;
        }

        Locale locale = Locale.forLanguageTag(language);
        textToSpeech.setLanguage(locale);
        textToSpeech.setSpeechRate(call.getFloat("rate", 1.0f));
        textToSpeech.setPitch(call.getFloat("pitch", 1.0f));

        String utteranceId = UUID.randomUUID().toString();
        Bundle params = new Bundle();
        params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId);
        params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, call.getFloat("volume", 1.0f));

        call.setKeepAlive(true);
        pendingCalls.put(utteranceId, call);
        int result = textToSpeech.speak(call.getString("text", ""), TextToSpeech.QUEUE_FLUSH, params, utteranceId);
        if (result == TextToSpeech.ERROR) {
            finishCall(utteranceId, "系统朗读未能开始。");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (textToSpeech != null) textToSpeech.stop();
        for (Map.Entry<String, PluginCall> entry : pendingCalls.entrySet()) {
            finishCall(entry.getKey(), null);
        }
        call.resolve();
    }

    private int languageAvailability(String language) {
        if (!initialized || textToSpeech == null) return TextToSpeech.LANG_NOT_SUPPORTED;
        return textToSpeech.isLanguageAvailable(Locale.forLanguageTag(language));
    }

    private void finishCall(String utteranceId, String error) {
        PluginCall call = pendingCalls.remove(utteranceId);
        if (call == null) return;
        call.setKeepAlive(false);
        if (error == null) call.resolve();
        else call.reject(error);
    }

    @Override
    protected void handleOnDestroy() {
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
        }
        super.handleOnDestroy();
    }
}
