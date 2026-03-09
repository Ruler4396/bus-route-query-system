package com.controller;

import com.annotation.IgnoreAuth;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("accessibility/tts")
public class AccessibilityTtsController {
    private static final String DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural";
    private static final int MAX_TEXT_LENGTH = 180;
    private static final int MAX_RETRIES = 1;
    private static final long GENERATE_TIMEOUT_MS = 45000L;

    @IgnoreAuth
    @RequestMapping("/audio")
    public ResponseEntity<byte[]> audio(@RequestParam("text") String text,
                                        @RequestParam(value = "voice", required = false) String voice) {
        try {
            String safeText = sanitizeText(text);
            if (StringUtils.isBlank(safeText)) {
                return ResponseEntity.badRequest().body("text 不能为空".getBytes(StandardCharsets.UTF_8));
            }
            String safeVoice = StringUtils.isNotBlank(voice) ? voice.trim() : DEFAULT_VOICE;
            Path cacheFile = resolveCacheFile(safeText, safeVoice);
            if (!Files.exists(cacheFile) || Files.size(cacheFile) <= 0) {
                generateAudio(cacheFile, safeText, safeVoice);
            }
            byte[] bytes = Files.readAllBytes(cacheFile);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("audio/mpeg"));
            headers.setContentLength(bytes.length);
            headers.setCacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic().getHeaderValue());
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + cacheFile.getFileName().toString() + "\"");
            return new ResponseEntity<byte[]>(bytes, headers, HttpStatus.OK);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(ex.getMessage().getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("生成语音失败: " + ex.getMessage()).getBytes(StandardCharsets.UTF_8));
        }
    }

    private String sanitizeText(String text) {
        String safe = StringUtils.defaultString(text).replaceAll("\\s+", " ").trim();
        if (safe.length() > MAX_TEXT_LENGTH) {
            safe = safe.substring(0, MAX_TEXT_LENGTH);
        }
        return safe;
    }

    private Path projectRoot() {
        return Paths.get("").toAbsolutePath().normalize();
    }

    private Path edgeTtsBin() {
        return projectRoot().resolve("runtime/tts-venv/bin/edge-tts");
    }

    private Path resolveCacheFile(String text, String voice) throws IOException {
        Path cacheDir = projectRoot().resolve("runtime/tts-cache");
        Files.createDirectories(cacheDir);
        return cacheDir.resolve(sha1(voice + "::" + text) + ".mp3");
    }

    private void generateAudio(Path cacheFile, String text, String voice) throws Exception {
        Path edgeBin = edgeTtsBin();
        if (!Files.exists(edgeBin)) {
            throw new IllegalStateException("开发环境未安装 edge-tts 兜底语音能力");
        }
        Path tmpFile = cacheFile.resolveSibling(cacheFile.getFileName().toString() + ".tmp");
        Files.deleteIfExists(tmpFile);
        Exception lastError = null;
        for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                runEdgeTts(edgeBin, voice, text, tmpFile);
                if (!Files.exists(tmpFile) || Files.size(tmpFile) <= 0) {
                    throw new IOException("edge-tts 未生成有效音频文件");
                }
                Files.move(tmpFile, cacheFile, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
                return;
            } catch (Exception ex) {
                lastError = ex;
                Files.deleteIfExists(tmpFile);
            }
        }
        throw lastError == null ? new IOException("未知语音生成错误") : lastError;
    }

    private void runEdgeTts(Path edgeBin, String voice, String text, Path outputFile) throws Exception {
        List<String> command = new ArrayList<String>();
        command.add(edgeBin.toString());
        command.add("--voice");
        command.add(voice);
        command.add("--text");
        command.add(text);
        command.add("--write-media");
        command.add(outputFile.toString());

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);
        Process process = pb.start();
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        try (InputStream in = process.getInputStream()) {
            copy(in, buffer);
        }
        boolean finished = process.waitFor(GENERATE_TIMEOUT_MS, TimeUnit.MILLISECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new IOException("edge-tts 生成超时");
        }
        if (process.exitValue() != 0) {
            throw new IOException("edge-tts 退出码=" + process.exitValue() + ", 输出=" + buffer.toString(StandardCharsets.UTF_8.name()));
        }
    }

    private void copy(InputStream in, ByteArrayOutputStream out) throws IOException {
        byte[] buf = new byte[4096];
        int len;
        while ((len = in.read(buf)) != -1) {
            out.write(buf, 0, len);
        }
    }

    private String sha1(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] bytes = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-1 不可用", e);
        }
    }
}
