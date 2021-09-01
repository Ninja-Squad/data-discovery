package fr.inra.urgi.datadiscovery.ontology;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.springframework.security.crypto.codec.Hex;
import org.springframework.stereotype.Component;

/**
 * An ID generator for trait classes.
 * Trait classes are fake entities which don't have a database ID. To identify them, we use their ontology DB ID and their name.
 * But since their name can be long and contain any kind of character, it's not really suitable for an ID that must be transmitted
 * as a path parameter. So, instead of transmitting this fake ID as is, we hash it, transform it to hex, and use that hex value
 * @author JB Nizet
 */
@Component
public class TraitClassIdGenerator {
    public String generateId(String ontologyDbId, String traitClassName) {
        String source = ontologyDbId + ":" + traitClassName;
        try {
            MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = messageDigest.digest(source.getBytes(StandardCharsets.UTF_8));
            return new String(Hex.encode(bytes));
        }
        catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Impossible to create SHA-256 message digest", e);
        }
    }
}
