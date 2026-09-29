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

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@CapacitorPlugin(name = "MagicTextToSpeech")
public class MagicTextToSpeechPlugin extends Plugin {
    private TextToSpeech textToSpeech;
    private boolean initialized = false;
    private final Map<String, PluginCall> pendingCalls = new ConcurrentHashMap<>();
    private final List<PluginCall> waitingForInitialization = new ArrayList<>();

    @Override
    public void load() {
        textToSpeech = new TextToSpeech(getContext(), status -> {
            List<PluginCall> waitingCalls;
            synchronized (this) {
                initialized = status == TextToSpeech.SUCCESS;
                waitingCalls = new ArrayList<>(waitingForInitialization);
                waitingForInitialization.clear();
            }
            for (PluginCall call : waitingCalls) {
                if (initialized) speakNow(call);
                else {
                    call.setKeepAlive(false);
                    call.reject("系统朗读引擎初始化失败。");
                }
            }
        });
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
        JSObject result = new JSObject();
        Locale locale = supportedLocale(call.getString("lang", ""));
        result.put("supported", locale != null);
        result.put("missingData", locale == null && initialized);
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
        synchronized (this) {
            if (!initialized || textToSpeech == null) {
                call.setKeepAlive(true);
                waitingForInitialization.add(call);
                return;
            }
        }
        speakNow(call);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (textToSpeech != null) textToSpeech.stop();
        for (Map.Entry<String, PluginCall> entry : pendingCalls.entrySet()) finishCall(entry.getKey(), null);
        synchronized (this) {
            for (PluginCall waitingCall : waitingForInitialization) {
                waitingCall.setKeepAlive(false);
                waitingCall.resolve();
            }
            waitingForInitialization.clear();
        }
        call.resolve();
    }

    private void speakNow(PluginCall call) {
        if (textToSpeech == null) {
            call.setKeepAlive(false);
            call.reject("系统朗读引擎尚未准备好。");
            return;
        }
        String language = call.getString("lang", "en-US");
        Locale locale = supportedLocale(language);
        if (locale == null) {
            call.setKeepAlive(false);
            call.reject("当前设备没有可用的 " + language + " 朗读语音。");
            return;
        }
        if (textToSpeech.setLanguage(locale) < TextToSpeech.LANG_AVAILABLE) {
            call.setKeepAlive(false);
            call.reject("当前设备无法启用 " + language + " 朗读语音。");
            return;
        }

        textToSpeech.setSpeechRate(call.getFloat("rate", 1.0f));
        textToSpeech.setPitch(call.getFloat("pitch", 1.0f));
        String utteranceId = UUID.randomUUID().toString();
        Bundle params = new Bundle();
        params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId);
        params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, call.getFloat("volume", 1.0f));

        call.setKeepAlive(true);
        pendingCalls.put(utteranceId, call);
        int result = textToSpeech.speak(call.getString("text", ""), TextToSpeech.QUEUE_FLUSH, params, utteranceId);
        if (result == TextToSpeech.ERROR) finishCall(utteranceId, "系统朗读未能开始。");
    }

    private Locale supportedLocale(String language) {
        if (!initialized || textToSpeech == null) return null;
        Set<Locale> candidates = new LinkedHashSet<>();
        if (language != null && !language.isEmpty()) candidates.add(Locale.forLanguageTag(language));
        if (language != null && language.toLowerCase(Locale.ROOT).startsWith("zh")) {
            candidates.add(Locale.SIMPLIFIED_CHINESE);
            candidates.add(Locale.CHINESE);
            candidates.add(Locale.forLanguageTag("zh-Hans-CN"));
        }
        for (Locale candidate : candidates) {
            if (textToSpeech.isLanguageAvailable(candidate) >= TextToSpeech.LANG_AVAILABLE) return candidate;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && language != null && language.toLowerCase(Locale.ROOT).startsWith("zh")) {
            for (Locale candidate : textToSpeech.getAvailableLanguages()) {
                if ("zh".equalsIgnoreCase(candidate.getLanguage()) && textToSpeech.isLanguageAvailable(candidate) >= TextToSpeech.LANG_AVAILABLE) return candidate;
            }
        }
        return null;
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
