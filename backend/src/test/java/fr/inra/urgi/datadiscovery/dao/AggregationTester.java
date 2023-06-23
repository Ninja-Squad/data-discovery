package fr.inra.urgi.datadiscovery.dao;

import java.util.List;

import fr.inra.urgi.datadiscovery.dto.AggregationDTO;
import fr.inra.urgi.datadiscovery.dto.BucketDTO;

/**
 * Utility to help testing a specific aggregation
 * @author JB Nizet
 */
public class AggregationTester {
    private final AggregationDTO aggregationDTO;

    public AggregationTester(AggregationDTO aggregationDTO) {
        this.aggregationDTO = aggregationDTO;
    }

    public List<String> getKeys() {
        return aggregationDTO.getBuckets().stream().map(BucketDTO::getKey).toList();
    }

    public List<Long> getDocumentCounts() {
        return aggregationDTO.getBuckets().stream().map(BucketDTO::getDocumentCount).toList();
    }

    public Long getDocumentCount(String key) {
        return aggregationDTO.getBuckets().stream().filter(bucket -> bucket.getKey().equals(key)).findAny().map(BucketDTO::getDocumentCount).orElseThrow();
    }
}
