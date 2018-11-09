package fr.inra.urgi.datadiscovery.harvest;

import java.io.InputStream;

/**
 * A stream to a file (or to any other input stream, which is useful for tests) supposed to contain a JSON array
 * of documents, along with the name of the file where this stream comes from.
 * @author JB Nizet
 */
public final class HarvestedStream {
    private final String fileName;
    private final InputStream inputStream;

    public HarvestedStream(String fileName, InputStream inputStream) {
        this.fileName = fileName;
        this.inputStream = inputStream;
    }

    public String getFileName() {
        return fileName;
    }

    public InputStream getInputStream() {
        return inputStream;
    }
}
