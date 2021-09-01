package fr.inra.urgi.datadiscovery.ontology.api;

/**
 * An API response from the BrAPI API
 * @author JB Nizet
 */
public final class ApiResponse<R> {
    private final Metadata metadata;
    private final R result;

    public ApiResponse(Metadata metadata, R result) {
        this.metadata = metadata;
        this.result = result;
    }

    public Metadata getMetadata() {
        return metadata;
    }

    public R getResult() {
        return result;
    }

    @Override
    public String toString() {
        return "ApiResponse{" +
                "metadata=" + metadata +
                ", result=" + result +
                '}';
    }
}
